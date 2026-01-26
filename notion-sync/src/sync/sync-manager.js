/**
 * Sync manager - orchestrates the synchronization process
 */
import * as logger from '../utils/logger.js';
import { createClient } from '../notion/client.js';
import { loadPageMapping } from '../config.js';
import {
  exploreFromRoot,
  exploreWorkspace,
  explorePages
} from '../notion/explorer.js';
import { buildPathMap, resolveConflicts } from './file-mapper.js';
import { blocksToMarkdown } from '../notion/blocks-to-markdown.js';
import { generateAndWriteFile } from '../markdown/generator.js';
import {
  loadSyncState,
  filterChangedPages,
  updateSyncState
} from './change-detector.js';

/**
 * Sync statistics
 */
class SyncStats {
  constructor() {
    this.total = 0;
    this.synced = 0;
    this.skipped = 0;
    this.failed = 0;
    this.errors = [];
  }

  addSuccess() {
    this.synced++;
  }

  addSkipped() {
    this.skipped++;
  }

  addFailure(pageId, error) {
    this.failed++;
    this.errors.push({ pageId, error: error.message });
  }

  print() {
    logger.section('Sync Summary');
    logger.info(`Total pages: ${this.total}`);
    logger.success(`Synced: ${this.synced}`);

    if (this.skipped > 0) {
      logger.info(`Skipped (up to date): ${this.skipped}`);
    }

    if (this.failed > 0) {
      logger.error(`Failed: ${this.failed}`);

      for (const { pageId, error } of this.errors) {
        logger.error(`  - ${pageId}: ${error}`);
      }
    }
  }
}

/**
 * Discover pages based on configuration
 */
async function discoverPages(client, config) {
  logger.section('Discovering Pages');

  let pages;

  if (config.specificPages && config.specificPages.length > 0) {
    // Sync specific pages
    logger.info(`Syncing ${config.specificPages.length} specific pages`);
    pages = await explorePages(client, config.specificPages);
  } else if (config.rootPages && config.rootPages.length > 0) {
    // Sync from root pages
    logger.info(`Syncing from ${config.rootPages.length} root pages`);

    pages = new Map();

    for (const rootPageId of config.rootPages) {
      const rootPages = await exploreFromRoot(client, rootPageId, config.recursive);

      for (const [pageId, pageData] of rootPages) {
        pages.set(pageId, pageData);
      }
    }

    logger.info(`Discovered ${pages.size} total pages from all roots`);
  } else {
    // Sync entire workspace
    logger.info('Syncing entire workspace');
    pages = await exploreWorkspace(client);
  }

  return pages;
}

/**
 * Sync a single page
 */
async function syncPage(client, pageId, pageData, outputPath, config, stats) {
  try {
    logger.debug(`Syncing page: ${pageData.title} (${pageId})`);

    // Convert page to markdown
    const markdown = await blocksToMarkdown(client, pageId);

    // Generate and write file
    await generateAndWriteFile(
      pageData.page,
      markdown,
      outputPath,
      config
    );

    stats.addSuccess();
    return true;
  } catch (err) {
    logger.errorWithStack(`Failed to sync page ${pageData.title}`, err);
    stats.addFailure(pageId, err);
    return false;
  }
}

/**
 * Main sync orchestrator
 */
export async function syncAll(config) {
  const stats = new SyncStats();

  try {
    // Initialize Notion client
    logger.section('Initializing');
    const client = createClient(config.notionApiKey);
    logger.info('Connected to Notion API');

    // Load page mapping
    const pageMapping = await loadPageMapping();
    logger.info('Loaded page mapping rules');

    // Discover pages
    let pages = await discoverPages(client, config);
    stats.total = pages.size;

    if (pages.size === 0) {
      logger.warn('No pages found to sync');
      return stats;
    }

    // Filter changed pages (incremental sync)
    if (config.syncMode === 'incremental' && !config.force) {
      logger.section('Filtering Changed Pages');
      const syncState = await loadSyncState();
      pages = filterChangedPages(pages, syncState);

      if (pages.size === 0) {
        logger.success('All pages are up to date!');
        stats.skipped = stats.total;
        return stats;
      }

      stats.skipped = stats.total - pages.size;
      stats.total = pages.size;
    }

    // Build path map
    logger.section('Mapping Paths');
    let pathMap = buildPathMap(pages, pageMapping, config);
    pathMap = resolveConflicts(pathMap);

    logger.info(`Mapped ${pathMap.size} pages to output paths`);

    // Sync pages
    logger.section('Syncing Pages');

    let current = 0;

    for (const [pageId, pageData] of pages) {
      current++;
      const outputPath = pathMap.get(pageId);

      logger.progress(current, pages.size, pageData.title);

      await syncPage(client, pageId, pageData, outputPath, config, stats);
    }

    // Update sync state
    if (!config.dryRun) {
      logger.section('Updating Sync State');
      await updateSyncState(pages);
      logger.success('Sync state updated');
    }

    // Print summary
    stats.print();

    return stats;
  } catch (err) {
    logger.errorWithStack('Sync failed', err);
    throw err;
  }
}

/**
 * Sync from a specific root page (shortcut for adventures)
 */
export async function syncFromRoot(config, rootPageId) {
  // Override config to sync from specific root
  const syncConfig = {
    ...config,
    rootPages: [rootPageId],
    recursive: true
  };

  return await syncAll(syncConfig);
}

/**
 * Sync specific pages by ID
 */
export async function syncSpecificPages(config, pageIds) {
  // Override config to sync specific pages
  const syncConfig = {
    ...config,
    specificPages: pageIds,
    recursive: false
  };

  return await syncAll(syncConfig);
}
