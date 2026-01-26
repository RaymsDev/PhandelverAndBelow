/**
 * File mapper - determines local file paths for Notion pages
 */
import path from 'path';
import * as logger from '../utils/logger.js';
import { toKebabCase } from '../utils/string-utils.js';

/**
 * Extract property value from Notion page
 */
function getProperty(page, propertyName) {
  if (!page.properties || !page.properties[propertyName]) {
    return null;
  }

  const prop = page.properties[propertyName];

  switch (prop.type) {
    case 'title':
      return prop.title.map(t => t.plain_text).join('');

    case 'rich_text':
      return prop.rich_text.map(t => t.plain_text).join('');

    case 'select':
      return prop.select ? prop.select.name : null;

    case 'multi_select':
      return prop.multi_select.map(s => s.name);

    case 'number':
      return prop.number;

    case 'checkbox':
      return prop.checkbox;

    case 'date':
      return prop.date ? prop.date.start : null;

    case 'people':
      return prop.people.map(p => p.name || p.id);

    case 'files':
      return prop.files.map(f => f.name);

    case 'url':
      return prop.url;

    case 'email':
      return prop.email;

    case 'phone_number':
      return prop.phone_number;

    default:
      return null;
  }
}

/**
 * Get page title (try various sources)
 */
function getPageTitle(page) {
  // Try properties first
  if (page.properties) {
    const titleProp = Object.values(page.properties).find(
      prop => prop.type === 'title'
    );

    if (titleProp && titleProp.title && titleProp.title.length > 0) {
      return titleProp.title.map(t => t.plain_text).join('');
    }
  }

  // Fallback to child_page/child_database
  if (page.child_page && page.child_page.title) {
    return page.child_page.title;
  }

  if (page.child_database && page.child_database.title) {
    return page.child_database.title;
  }

  return 'Untitled';
}

/**
 * Apply mapping rules to determine output folder
 */
function applyMappingRules(page, mappingRules) {
  for (const rule of mappingRules) {
    const { condition, output } = rule;

    // Check if condition matches
    let matches = true;

    if (condition.parent) {
      // Check parent ID
      const parentId = page.parent?.page_id || page.parent?.database_id;
      if (parentId !== condition.parent) {
        matches = false;
      }
    }

    if (condition.property && condition.value) {
      // Check property value
      const propValue = getProperty(page, condition.property);
      if (propValue !== condition.value) {
        matches = false;
      }
    }

    if (condition.database) {
      // Check if page is from specific database
      if (page.parent?.type !== 'database_id') {
        matches = false;
      }
      // Note: We'd need to fetch database info to check title
      // For now, skip this check
    }

    if (matches) {
      logger.debug(`Page ${page.id} matched rule: ${JSON.stringify(condition)} → ${output}`);
      return output;
    }
  }

  return null;
}

/**
 * Determine output folder for a page
 */
export function determineFolder(page, pageMapping, config) {
  const { mappingRules, defaultOutput } = pageMapping;

  // Apply mapping rules
  const folder = applyMappingRules(page, mappingRules);

  if (folder) {
    return folder;
  }

  // Fallback to default output
  logger.debug(`Page ${page.id} using default output: ${defaultOutput}`);
  return defaultOutput;
}

/**
 * Generate filename from page title
 */
export function generateFilename(page) {
  const title = getPageTitle(page);
  const kebab = toKebabCase(title);

  // Ensure filename is not empty
  if (!kebab || kebab.length === 0) {
    return `untitled-${page.id.slice(0, 8)}`;
  }

  return kebab;
}

/**
 * Get full output path for a page
 */
export function getOutputPath(page, pageMapping, config) {
  const folder = determineFolder(page, pageMapping, config);
  const filename = generateFilename(page);

  const fullPath = path.join(config.outputDir, folder, `${filename}.md`);

  logger.debug(`Mapped page "${getPageTitle(page)}" → ${fullPath}`);

  return fullPath;
}

/**
 * Get output directory (without filename) for a page
 */
export function getOutputDir(page, pageMapping, config) {
  const folder = determineFolder(page, pageMapping, config);
  return path.join(config.outputDir, folder);
}

/**
 * Build a map of page IDs to output paths
 */
export function buildPathMap(pages, pageMapping, config) {
  const pathMap = new Map();

  for (const [pageId, pageData] of pages) {
    const outputPath = getOutputPath(pageData.page, pageMapping, config);
    pathMap.set(pageId, outputPath);
  }

  logger.info(`Built path map for ${pathMap.size} pages`);
  return pathMap;
}

/**
 * Check for filename conflicts and resolve them
 */
export function resolveConflicts(pathMap) {
  const paths = Array.from(pathMap.values());
  const conflicts = paths.filter((path, index) =>
    paths.indexOf(path) !== index
  );

  if (conflicts.length > 0) {
    logger.warn(`Found ${conflicts.length} filename conflicts, resolving...`);

    // Track which paths we've seen and their counts
    const pathCounts = new Map();
    const resolvedMap = new Map();

    for (const [pageId, outputPath] of pathMap) {
      if (!pathCounts.has(outputPath)) {
        // First occurrence, use as-is
        pathCounts.set(outputPath, 1);
        resolvedMap.set(pageId, outputPath);
      } else {
        // Conflict: append counter
        const count = pathCounts.get(outputPath) + 1;
        pathCounts.set(outputPath, count);

        const dir = path.dirname(outputPath);
        const ext = path.extname(outputPath);
        const base = path.basename(outputPath, ext);
        const newPath = path.join(dir, `${base}-${count}${ext}`);

        resolvedMap.set(pageId, newPath);
        logger.debug(`Resolved conflict: ${outputPath} → ${newPath}`);
      }
    }

    return resolvedMap;
  }

  return pathMap;
}
