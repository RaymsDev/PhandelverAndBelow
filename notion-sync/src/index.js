#!/usr/bin/env node

/**
 * CLI entry point for Notion sync
 */
import { Command } from 'commander';
import chalk from 'chalk';
import * as logger from './utils/logger.js';
import * as fs from './utils/file-system.js';
import { loadConfig, validateConfig } from './config.js';
import { syncAll, syncFromRoot, syncSpecificPages } from './sync/sync-manager.js';
import { getSyncStats, clearSyncState } from './sync/change-detector.js';

const program = new Command();

/**
 * Print banner
 */
function printBanner() {
  console.log(chalk.cyan.bold('\n━━━ Notion → Markdown Sync ━━━\n'));
}

/**
 * Init command - set up configuration
 */
async function handleInit() {
  printBanner();
  logger.section('Initialization');

  try {
    // Check if .env exists
    const envPath = fs.resolveProjectPath('.env');
    const envExists = await fs.exists(envPath);

    if (!envExists) {
      // Copy .env.example to .env
      const examplePath = fs.resolveProjectPath('.env.example');

      if (await fs.exists(examplePath)) {
        await fs.copyFile(examplePath, envPath);
        logger.success('Created .env file from .env.example');
        logger.info('\nNext steps:');
        logger.info('1. Edit .env and add your NOTION_API_KEY');
        logger.info('   Get it from: https://www.notion.so/my-integrations');
        logger.info('2. Share your Notion pages with the integration');
        logger.info('3. Run: npm run sync');
      } else {
        logger.error('.env.example not found');
      }
    } else {
      logger.info('.env file already exists');
    }

    // Check if cache directory exists
    const cacheDir = fs.resolveProjectPath('cache');
    await fs.ensureDir(cacheDir);
    logger.success('Cache directory ready');

    // Check config files
    const configPath = fs.resolveProjectPath('config', 'sync-config.json');

    if (await fs.exists(configPath)) {
      logger.success('Configuration file found');
    } else {
      logger.warn('Configuration file not found at config/sync-config.json');
    }

    logger.success('\nInitialization complete!');
  } catch (err) {
    logger.errorWithStack('Initialization failed', err);
    process.exit(1);
  }
}

/**
 * Sync command - synchronize Notion to markdown
 */
async function handleSync(options) {
  printBanner();

  try {
    // Load configuration
    const config = await loadConfig(options);
    validateConfig(config);

    // Determine sync type
    if (options.root) {
      logger.info(`Syncing from root page: ${options.root}`);
      await syncFromRoot(config, options.root);
    } else if (options.pages) {
      logger.info(`Syncing specific pages: ${options.pages}`);
      const pageIds = options.pages.split(',');
      await syncSpecificPages(config, pageIds);
    } else {
      // Full sync
      await syncAll(config);
    }

    logger.success('\n✨ Sync complete!');
  } catch (err) {
    logger.errorWithStack('\nSync failed', err);
    process.exit(1);
  }
}

/**
 * Status command - show sync statistics
 */
async function handleStatus() {
  printBanner();
  logger.section('Sync Status');

  try {
    const stats = await getSyncStats();

    if (!stats.lastSync) {
      logger.info('No sync has been performed yet');
      logger.info('Run: npm run sync');
      return;
    }

    logger.info(`Last sync: ${new Date(stats.lastSync).toLocaleString()}`);
    logger.info(`Pages tracked: ${stats.pageCount}`);

    // Show some example pages
    const pages = Object.values(stats.pages).slice(0, 5);

    if (pages.length > 0) {
      console.log('\nRecent pages:');

      for (const page of pages) {
        const lastEdited = new Date(page.lastEditedTime).toLocaleString();
        console.log(chalk.gray(`  - ${page.id} (edited: ${lastEdited})`));
      }
    }

    if (stats.pageCount > 5) {
      console.log(chalk.gray(`  ... and ${stats.pageCount - 5} more`));
    }
  } catch (err) {
    logger.errorWithStack('Failed to get status', err);
    process.exit(1);
  }
}

/**
 * Clear command - clear sync state
 */
async function handleClear() {
  printBanner();
  logger.section('Clear Sync State');

  try {
    await clearSyncState();
    logger.success('Sync state cleared');
    logger.info('Next sync will be a full sync');
  } catch (err) {
    logger.errorWithStack('Failed to clear state', err);
    process.exit(1);
  }
}

/**
 * Set up CLI
 */
program
  .name('notion-sync')
  .description('Synchronize Notion workspace to local Markdown files')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize configuration and environment')
  .action(handleInit);

program
  .command('sync')
  .description('Synchronize Notion pages to Markdown')
  .option('--root <pageId>', 'Sync from a specific root page')
  .option('--pages <pageIds>', 'Sync specific pages (comma-separated IDs)')
  .option('--incremental', 'Incremental sync (only changed pages)', false)
  .option('--force', 'Force full resync of all pages', false)
  .option('--output <dir>', 'Output directory')
  .option('--config <file>', 'Custom config file')
  .option('--verbose', 'Verbose logging', false)
  .option('--dry-run', 'Preview without writing files', false)
  .action(handleSync);

program
  .command('status')
  .description('Show sync statistics')
  .action(handleStatus);

program
  .command('clear')
  .description('Clear sync state (force full resync next time)')
  .action(handleClear);

// Parse command line arguments
program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
