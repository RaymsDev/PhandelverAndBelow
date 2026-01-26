/**
 * Notion API client wrapper with retry logic and rate limiting
 */
import { Client } from '@notionhq/client';
import * as logger from '../utils/logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RATE_LIMIT_DELAY_MS = 334; // ~3 requests per second

class NotionClient {
  constructor(apiKey) {
    this.client = new Client({ auth: apiKey });
    this.lastRequestTime = 0;
    this.requestCache = new Map();
  }

  /**
   * Rate limiting: ensure we don't exceed 3 requests per second
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
      const delay = RATE_LIMIT_DELAY_MS - timeSinceLastRequest;
      await this.sleep(delay);
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry wrapper with exponential backoff
   */
  async retryRequest(fn, context = '') {
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.rateLimit();
        return await fn();
      } catch (err) {
        lastError = err;

        // Don't retry on authentication or permission errors
        if (err.code === 'unauthorized' ||
            err.code === 'restricted_resource' ||
            err.code === 'object_not_found') {
          throw err;
        }

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          logger.warn(
            `Request failed (attempt ${attempt}/${MAX_RETRIES})${context ? ` for ${context}` : ''}: ${err.message}. ` +
            `Retrying in ${delay}ms...`
          );
          await this.sleep(delay);
        }
      }
    }

    throw new Error(
      `Request failed after ${MAX_RETRIES} attempts${context ? ` for ${context}` : ''}: ${lastError.message}`
    );
  }

  /**
   * Get cache key for a request
   */
  getCacheKey(method, ...args) {
    return `${method}:${JSON.stringify(args)}`;
  }

  /**
   * Check if cached response exists
   */
  getFromCache(key) {
    return this.requestCache.get(key);
  }

  /**
   * Save response to cache
   */
  saveToCache(key, value) {
    this.requestCache.set(key, value);
  }

  /**
   * Get a page by ID
   */
  async getPage(pageId) {
    const cacheKey = this.getCacheKey('getPage', pageId);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache hit for page ${pageId}`);
      return cached;
    }

    logger.debug(`Fetching page ${pageId}`);

    const page = await this.retryRequest(
      () => this.client.pages.retrieve({ page_id: pageId }),
      `page ${pageId}`
    );

    this.saveToCache(cacheKey, page);
    return page;
  }

  /**
   * Get all blocks children with automatic pagination
   */
  async getBlockChildren(blockId) {
    logger.debug(`Fetching blocks for ${blockId}`);

    const blocks = [];
    let cursor;
    let hasMore = true;

    while (hasMore) {
      const response = await this.retryRequest(
        () => this.client.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: 100
        }),
        `blocks for ${blockId}`
      );

      blocks.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;

      if (hasMore) {
        logger.debug(`Fetched ${blocks.length} blocks, fetching more...`);
      }
    }

    logger.debug(`Fetched ${blocks.length} total blocks for ${blockId}`);
    return blocks;
  }

  /**
   * Search for pages in the workspace
   */
  async searchPages(query = '', filter = null) {
    logger.debug(`Searching pages with query: "${query}"`);

    const pages = [];
    let cursor;
    let hasMore = true;

    const searchParams = {
      page_size: 100
    };

    if (query) {
      searchParams.query = query;
    }

    if (filter) {
      searchParams.filter = filter;
    }

    while (hasMore) {
      if (cursor) {
        searchParams.start_cursor = cursor;
      }

      const response = await this.retryRequest(
        () => this.client.search(searchParams),
        `search "${query}"`
      );

      pages.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;

      if (hasMore) {
        logger.debug(`Found ${pages.length} pages, searching more...`);
      }
    }

    logger.debug(`Found ${pages.length} total pages`);
    return pages;
  }

  /**
   * Query a database
   */
  async queryDatabase(databaseId, filter = null, sorts = null) {
    logger.debug(`Querying database ${databaseId}`);

    const pages = [];
    let cursor;
    let hasMore = true;

    while (hasMore) {
      const queryParams = {
        database_id: databaseId,
        page_size: 100
      };

      if (cursor) {
        queryParams.start_cursor = cursor;
      }

      if (filter) {
        queryParams.filter = filter;
      }

      if (sorts) {
        queryParams.sorts = sorts;
      }

      const response = await this.retryRequest(
        () => this.client.databases.query(queryParams),
        `database ${databaseId}`
      );

      pages.push(...response.results);
      hasMore = response.has_more;
      cursor = response.next_cursor;

      if (hasMore) {
        logger.debug(`Queried ${pages.length} pages, querying more...`);
      }
    }

    logger.debug(`Queried ${pages.length} total pages from database`);
    return pages;
  }

  /**
   * Get database schema
   */
  async getDatabase(databaseId) {
    const cacheKey = this.getCacheKey('getDatabase', databaseId);
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      logger.debug(`Cache hit for database ${databaseId}`);
      return cached;
    }

    logger.debug(`Fetching database ${databaseId}`);

    const database = await this.retryRequest(
      () => this.client.databases.retrieve({ database_id: databaseId }),
      `database ${databaseId}`
    );

    this.saveToCache(cacheKey, database);
    return database;
  }

  /**
   * List all databases in workspace
   */
  async listDatabases() {
    logger.debug('Listing all databases');

    // Search for all databases
    return await this.searchPages('', { property: 'object', value: 'database' });
  }

  /**
   * Clear the request cache
   */
  clearCache() {
    this.requestCache.clear();
    logger.debug('Cache cleared');
  }
}

/**
 * Create and export a Notion client instance
 */
export function createClient(apiKey) {
  return new NotionClient(apiKey);
}
