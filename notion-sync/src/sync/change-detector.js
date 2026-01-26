/**
 * Change detector - identifies pages that need to be synced
 * Implements incremental sync by tracking timestamps
 */
import path from 'path';
import * as logger from '../utils/logger.js';
import * as fs from '../utils/file-system.js';

const SYNC_STATE_FILE = 'cache/sync-state.json';

/**
 * Get sync state file path
 */
function getSyncStatePath() {
  return fs.resolveProjectPath(SYNC_STATE_FILE);
}

/**
 * Load sync state from cache
 */
export async function loadSyncState() {
  const statePath = getSyncStatePath();

  try {
    if (await fs.exists(statePath)) {
      const state = await fs.readJSON(statePath);
      logger.debug(`Loaded sync state: ${Object.keys(state.pages || {}).length} pages tracked`);
      return state;
    }
  } catch (err) {
    logger.warn(`Failed to load sync state: ${err.message}`);
  }

  // Return empty state
  return {
    lastSync: null,
    pages: {}
  };
}

/**
 * Save sync state to cache
 */
export async function saveSyncState(state) {
  const statePath = getSyncStatePath();

  try {
    // Ensure cache directory exists
    await fs.ensureDir(path.dirname(statePath));

    // Save state
    await fs.writeJSON(statePath, state);

    logger.debug(`Saved sync state: ${Object.keys(state.pages || {}).length} pages`);
    return true;
  } catch (err) {
    logger.error(`Failed to save sync state: ${err.message}`);
    return false;
  }
}

/**
 * Update sync state with a page
 */
export function updatePageInState(state, pageId, page) {
  if (!state.pages) {
    state.pages = {};
  }

  state.pages[pageId] = {
    id: pageId,
    lastEditedTime: page.last_edited_time,
    lastSyncedAt: new Date().toISOString()
  };

  return state;
}

/**
 * Check if a page has changed since last sync
 */
export function hasPageChanged(page, syncState) {
  if (!syncState.pages || !syncState.pages[page.id]) {
    logger.debug(`Page ${page.id} is new (not in sync state)`);
    return true;
  }

  const cachedPage = syncState.pages[page.id];
  const pageModTime = new Date(page.last_edited_time);
  const cachedModTime = new Date(cachedPage.lastEditedTime);

  if (pageModTime > cachedModTime) {
    logger.debug(
      `Page ${page.id} has changed: ` +
      `current ${page.last_edited_time}, ` +
      `cached ${cachedPage.lastEditedTime}`
    );
    return true;
  }

  logger.debug(`Page ${page.id} unchanged`);
  return false;
}

/**
 * Filter pages that need to be synced
 */
export function filterChangedPages(pages, syncState) {
  if (!syncState || !syncState.pages) {
    logger.info('No sync state found, syncing all pages');
    return pages;
  }

  const changedPages = new Map();

  for (const [pageId, pageData] of pages) {
    if (hasPageChanged(pageData.page, syncState)) {
      changedPages.set(pageId, pageData);
    }
  }

  const skipped = pages.size - changedPages.size;

  logger.info(
    `Filtered pages: ${changedPages.size} changed, ${skipped} skipped (up to date)`
  );

  return changedPages;
}

/**
 * Update sync state after successful sync
 */
export async function updateSyncState(pages) {
  const state = await loadSyncState();

  // Update last sync time
  state.lastSync = new Date().toISOString();

  // Update each page
  for (const [pageId, pageData] of pages) {
    updatePageInState(state, pageId, pageData.page);
  }

  // Save state
  await saveSyncState(state);

  return state;
}

/**
 * Clear sync state (force full resync next time)
 */
export async function clearSyncState() {
  const statePath = getSyncStatePath();

  try {
    if (await fs.exists(statePath)) {
      await fs.deleteFile(statePath);
      logger.info('Cleared sync state');
      return true;
    }
  } catch (err) {
    logger.error(`Failed to clear sync state: ${err.message}`);
    return false;
  }

  return true;
}

/**
 * Get sync statistics
 */
export async function getSyncStats() {
  const state = await loadSyncState();

  return {
    lastSync: state.lastSync,
    pageCount: Object.keys(state.pages || {}).length,
    pages: state.pages || {}
  };
}
