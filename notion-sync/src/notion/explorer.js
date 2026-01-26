/**
 * Page explorer - discovers pages recursively in Notion workspace
 */
import * as logger from '../utils/logger.js';

/**
 * Extract page title from Notion page object
 */
function getPageTitle(page) {
  try {
    // Try to get title from properties
    if (page.properties) {
      // Look for title property
      const titleProp = Object.values(page.properties).find(
        prop => prop.type === 'title'
      );

      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        return titleProp.title.map(t => t.plain_text).join('');
      }
    }

    // Fallback to child_page or child_database title
    if (page.child_page && page.child_page.title) {
      return page.child_page.title;
    }

    if (page.child_database && page.child_database.title) {
      return page.child_database.title;
    }

    // Last resort: use page ID
    return `Untitled (${page.id})`;
  } catch (err) {
    logger.warn(`Failed to extract title from page ${page.id}: ${err.message}`);
    return `Untitled (${page.id})`;
  }
}

/**
 * Get parent ID from page
 */
function getParentId(page) {
  if (page.parent) {
    if (page.parent.type === 'page_id') {
      return page.parent.page_id;
    }
    if (page.parent.type === 'database_id') {
      return page.parent.database_id;
    }
    if (page.parent.type === 'workspace') {
      return 'workspace';
    }
  }
  return null;
}

/**
 * Explore pages recursively starting from a root page
 */
export async function exploreFromRoot(client, rootPageId, recursive = true) {
  logger.debug(`Exploring from root page: ${rootPageId}`);

  const pages = new Map();
  const toExplore = [rootPageId];
  const visited = new Set();

  while (toExplore.length > 0) {
    const pageId = toExplore.shift();

    // Skip if already visited (prevent infinite loops)
    if (visited.has(pageId)) {
      continue;
    }

    visited.add(pageId);

    try {
      // Get page metadata
      const page = await client.getPage(pageId);
      const title = getPageTitle(page);
      const parentId = getParentId(page);

      pages.set(pageId, {
        id: pageId,
        title,
        page,
        parentId,
        children: []
      });

      logger.debug(`Found page: ${title} (${pageId})`);

      // Get child blocks if recursive
      if (recursive) {
        const blocks = await client.getBlockChildren(pageId);

        // Find child pages and databases
        for (const block of blocks) {
          if (block.type === 'child_page') {
            toExplore.push(block.id);
            pages.get(pageId).children.push(block.id);
          } else if (block.type === 'child_database') {
            toExplore.push(block.id);
            pages.get(pageId).children.push(block.id);
          }
        }
      }
    } catch (err) {
      logger.error(`Failed to explore page ${pageId}: ${err.message}`);
    }
  }

  logger.info(`Discovered ${pages.size} pages from root ${rootPageId}`);
  return pages;
}

/**
 * Explore all accessible pages in the workspace
 */
export async function exploreWorkspace(client) {
  logger.debug('Exploring entire workspace');

  const pages = new Map();

  try {
    // Search for all pages
    const searchResults = await client.searchPages('', {
      property: 'object',
      value: 'page'
    });

    for (const page of searchResults) {
      const title = getPageTitle(page);
      const parentId = getParentId(page);

      pages.set(page.id, {
        id: page.id,
        title,
        page,
        parentId,
        children: []
      });
    }

    logger.info(`Discovered ${pages.size} pages in workspace`);
  } catch (err) {
    logger.error(`Failed to explore workspace: ${err.message}`);
  }

  return pages;
}

/**
 * Explore specific page IDs
 */
export async function explorePages(client, pageIds) {
  logger.debug(`Exploring ${pageIds.length} specific pages`);

  const pages = new Map();

  for (const pageId of pageIds) {
    try {
      const page = await client.getPage(pageId);
      const title = getPageTitle(page);
      const parentId = getParentId(page);

      pages.set(pageId, {
        id: pageId,
        title,
        page,
        parentId,
        children: []
      });

      logger.debug(`Found page: ${title} (${pageId})`);
    } catch (err) {
      logger.error(`Failed to fetch page ${pageId}: ${err.message}`);
    }
  }

  logger.info(`Discovered ${pages.size} pages`);
  return pages;
}

/**
 * Build hierarchical tree from flat page map
 */
export function buildPageTree(pages) {
  const tree = [];
  const pageMap = new Map(pages);

  // Find root pages (no parent or workspace parent)
  for (const [pageId, pageData] of pageMap) {
    if (!pageData.parentId || pageData.parentId === 'workspace') {
      tree.push(pageData);
    }
  }

  logger.debug(`Built tree with ${tree.length} root pages`);
  return tree;
}

/**
 * Filter pages by parent ID
 */
export function filterByParent(pages, parentId) {
  const filtered = new Map();

  for (const [pageId, pageData] of pages) {
    if (pageData.parentId === parentId) {
      filtered.set(pageId, pageData);
    }
  }

  logger.debug(`Filtered ${filtered.size} pages with parent ${parentId}`);
  return filtered;
}

/**
 * Get all children of a page (recursive)
 */
export function getAllChildren(pages, parentId) {
  const children = [];
  const visited = new Set();

  function traverse(id) {
    if (visited.has(id)) {
      return;
    }
    visited.add(id);

    const pageData = pages.get(id);
    if (!pageData) {
      return;
    }

    children.push(pageData);

    for (const childId of pageData.children) {
      traverse(childId);
    }
  }

  const parentData = pages.get(parentId);
  if (parentData) {
    for (const childId of parentData.children) {
      traverse(childId);
    }
  }

  return children;
}
