/**
 * Frontmatter generator for markdown files
 * Generates YAML frontmatter following project conventions
 */
import yaml from 'yaml';
import * as logger from '../utils/logger.js';

/**
 * Extract property value from Notion page
 */
function getPropertyValue(page, propertyName) {
  if (!page.properties || !page.properties[propertyName]) {
    return null;
  }

  const prop = page.properties[propertyName];

  switch (prop.type) {
    case 'title':
      return prop.title.map(t => t.plain_text).join('') || null;

    case 'rich_text':
      return prop.rich_text.map(t => t.plain_text).join('') || null;

    case 'select':
      return prop.select ? prop.select.name : null;

    case 'multi_select':
      return prop.multi_select.length > 0
        ? prop.multi_select.map(s => s.name).join(', ')
        : null;

    case 'number':
      return prop.number;

    case 'checkbox':
      return prop.checkbox;

    case 'date':
      return prop.date ? prop.date.start : null;

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
 * Get page title
 */
function getPageTitle(page) {
  if (page.properties) {
    const titleProp = Object.values(page.properties).find(
      prop => prop.type === 'title'
    );

    if (titleProp && titleProp.title && titleProp.title.length > 0) {
      return titleProp.title.map(t => t.plain_text).join('');
    }
  }

  return 'Untitled';
}

/**
 * Get page URL
 */
function getPageUrl(page) {
  return page.url || `https://notion.so/${page.id.replace(/-/g, '')}`;
}

/**
 * Generate frontmatter metadata from Notion page
 */
export function generateFrontmatter(page, config) {
  const { frontmatterMapping } = config;
  const metadata = {};

  // Always include nom (title)
  metadata.nom = getPageTitle(page);

  // Map properties based on configuration
  for (const [notionProp, yamlField] of Object.entries(frontmatterMapping)) {
    if (notionProp === 'Title') {
      continue; // Already handled above
    }

    const value = getPropertyValue(page, notionProp);

    // Only include non-null values
    if (value !== null && value !== undefined && value !== '') {
      metadata[yamlField] = value;
    } else {
      // Include null for expected fields
      if (['race', 'type', 'role', 'faction', 'lieu', 'gender'].includes(yamlField)) {
        metadata[yamlField] = null;
      }
    }
  }

  // Always include notion_id and notion_url
  metadata.notion_id = page.id;
  metadata.notion_url = getPageUrl(page);

  logger.debug(`Generated frontmatter for page ${page.id}`);
  logger.debugObject('Frontmatter', metadata);

  return metadata;
}

/**
 * Convert metadata object to YAML frontmatter string
 */
export function metadataToYaml(metadata) {
  try {
    // Use yaml library to stringify
    const yamlString = yaml.stringify(metadata, {
      defaultStringType: 'QUOTE_DOUBLE',
      defaultKeyType: 'PLAIN',
      nullStr: 'null'
    });

    // Wrap in frontmatter delimiters
    return `---\n${yamlString}---`;
  } catch (err) {
    logger.error(`Failed to convert metadata to YAML: ${err.message}`);
    throw err;
  }
}

/**
 * Generate complete frontmatter block for a page
 */
export function createFrontmatter(page, config) {
  const metadata = generateFrontmatter(page, config);
  return metadataToYaml(metadata);
}

/**
 * Parse existing frontmatter from markdown file
 */
export function parseFrontmatter(markdownContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = markdownContent.match(frontmatterRegex);

  if (!match) {
    return { metadata: null, content: markdownContent };
  }

  try {
    const metadata = yaml.parse(match[1]);
    const content = markdownContent.slice(match[0].length).trim();
    return { metadata, content };
  } catch (err) {
    logger.warn(`Failed to parse frontmatter: ${err.message}`);
    return { metadata: null, content: markdownContent };
  }
}

/**
 * Update frontmatter in existing markdown content
 */
export function updateFrontmatter(markdownContent, newMetadata) {
  const { content } = parseFrontmatter(markdownContent);
  const yamlFrontmatter = metadataToYaml(newMetadata);

  return `${yamlFrontmatter}\n\n${content}`;
}
