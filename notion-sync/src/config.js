/**
 * Configuration loader
 * Loads configuration from multiple sources with priority:
 * 1. CLI arguments (highest priority)
 * 2. Environment variables
 * 3. config/sync-config.json
 * 4. Defaults (lowest priority)
 */
import dotenv from 'dotenv';
import path from 'path';
import { readJSON, exists, resolveProjectPath } from './utils/file-system.js';
import * as logger from './utils/logger.js';

// Load environment variables from .env file
dotenv.config({ path: resolveProjectPath('.env') });

/**
 * Default configuration
 */
const defaults = {
  outputDir: '../notion-import',
  syncMode: 'incremental',
  rootPages: [],
  pageTypeMapping: {
    'Adventures': 'adventures',
    'Personnages': 'personnages',
    'Lieux': 'lieux',
    'Factions': 'factions',
    'Sessions': 'sessions'
  },
  frontmatterMapping: {
    'Title': 'nom',
    'Race': 'race',
    'Type': 'type',
    'Role': 'role',
    'Faction': 'faction',
    'Location': 'lieu',
    'Gender': 'gender'
  },
  mediaStrategy: 'url',
  recursive: true,
  verbose: false,
  dryRun: false,
  force: false
};

/**
 * Load configuration from file
 */
async function loadConfigFile(configPath) {
  try {
    if (await exists(configPath)) {
      const config = await readJSON(configPath);
      logger.debug(`Loaded config from ${configPath}`);
      return config;
    }
  } catch (err) {
    logger.warn(`Failed to load config file ${configPath}: ${err.message}`);
  }
  return {};
}

/**
 * Get Notion API key from environment
 */
function getNotionApiKey() {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    throw new Error(
      'NOTION_API_KEY not found in environment variables.\n' +
      'Please set it in your .env file or export it as an environment variable.\n' +
      'Get your API key from: https://www.notion.so/my-integrations'
    );
  }

  return apiKey;
}

/**
 * Merge configurations with priority
 */
function mergeConfigs(...configs) {
  return Object.assign({}, ...configs);
}

/**
 * Parse CLI options into config
 */
function parseCliOptions(options) {
  const config = {};

  if (options.output) {
    config.outputDir = options.output;
  }

  if (options.root) {
    config.rootPages = options.root.split(',');
  }

  if (options.pages) {
    config.specificPages = options.pages.split(',');
  }

  if (options.incremental) {
    config.syncMode = 'incremental';
  }

  if (options.verbose) {
    config.verbose = true;
  }

  if (options.dryRun) {
    config.dryRun = true;
  }

  if (options.force !== undefined) {
    config.force = options.force;
    if (options.force) {
      config.syncMode = 'full';
    }
  }

  if (options.config) {
    config.configFile = options.config;
  }

  return config;
}

/**
 * Load and merge all configuration sources
 */
export async function loadConfig(cliOptions = {}) {
  // Parse CLI options
  const cliConfig = parseCliOptions(cliOptions);

  // Determine config file path
  const configFilePath = cliConfig.configFile ||
                        resolveProjectPath('config', 'sync-config.json');

  // Load config file
  const fileConfig = await loadConfigFile(configFilePath);

  // Load environment variables (only include defined values)
  const envConfig = {};
  if (process.env.OUTPUT_DIR) {
    envConfig.outputDir = process.env.OUTPUT_DIR;
  }
  if (process.env.SYNC_MODE) {
    envConfig.syncMode = process.env.SYNC_MODE;
  }
  if (process.env.VERBOSE === 'true') {
    envConfig.verbose = true;
  }

  // Merge all configs (priority: CLI > env > file > defaults)
  const config = mergeConfigs(defaults, fileConfig, envConfig, cliConfig);

  // Get API key
  try {
    config.notionApiKey = getNotionApiKey();
  } catch (err) {
    logger.error(err.message);
    process.exit(1);
  }

  // Resolve output directory to absolute path
  if (config.outputDir) {
    config.outputDir = path.resolve(resolveProjectPath(), config.outputDir);
  } else {
    // Fallback to default if somehow undefined
    config.outputDir = path.resolve(resolveProjectPath(), '../notion-import');
  }

  // Set verbose mode in logger
  logger.setVerbose(config.verbose);

  // Log configuration in debug mode
  logger.debug('Configuration loaded:');
  logger.debugObject('Config', {
    ...config,
    notionApiKey: config.notionApiKey ? '***hidden***' : 'not set'
  });

  return config;
}

/**
 * Load page mapping rules
 */
export async function loadPageMapping() {
  const mappingPath = resolveProjectPath('config', 'page-mapping.json');

  try {
    if (await exists(mappingPath)) {
      const mapping = await readJSON(mappingPath);
      logger.debug('Loaded page mapping rules');
      return mapping;
    }
  } catch (err) {
    logger.warn(`Failed to load page mapping: ${err.message}`);
  }

  return { mappingRules: [], defaultOutput: 'misc' };
}

/**
 * Validate configuration
 */
export function validateConfig(config) {
  const errors = [];

  if (!config.notionApiKey) {
    errors.push('NOTION_API_KEY is required');
  }

  if (!config.outputDir) {
    errors.push('outputDir is required');
  }

  if (config.syncMode !== 'incremental' && config.syncMode !== 'full') {
    errors.push('syncMode must be "incremental" or "full"');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
}
