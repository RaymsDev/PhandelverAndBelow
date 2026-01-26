/**
 * Markdown file generator
 * Combines frontmatter and content, writes to file
 */
import path from 'path';
import * as logger from '../utils/logger.js';
import * as fs from '../utils/file-system.js';
import { createFrontmatter } from './frontmatter.js';

/**
 * Generate complete markdown file content
 */
export function generateMarkdown(page, markdownContent, config) {
  const frontmatter = createFrontmatter(page, config);

  // Get page title for H1 header
  const title = page.properties?.Title?.title?.[0]?.plain_text ||
                page.properties?.Name?.title?.[0]?.plain_text ||
                Object.values(page.properties || {}).find(p => p.type === 'title')
                  ?.title?.[0]?.plain_text ||
                'Untitled';

  // Combine frontmatter, title, and content
  const fullContent = [
    frontmatter,
    '',
    `# ${title}`,
    '',
    markdownContent
  ].join('\n');

  return fullContent;
}

/**
 * Write markdown file to disk
 */
export async function writeMarkdownFile(filePath, content, dryRun = false) {
  try {
    if (dryRun) {
      logger.info(`[DRY RUN] Would write to: ${filePath}`);
      return true;
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.ensureDir(dir);

    // Write file
    await fs.writeFile(filePath, content);

    logger.debug(`Wrote file: ${filePath}`);
    return true;
  } catch (err) {
    logger.error(`Failed to write file ${filePath}: ${err.message}`);
    throw err;
  }
}

/**
 * Generate and write markdown file for a page
 */
export async function generateAndWriteFile(
  page,
  markdownContent,
  outputPath,
  config
) {
  try {
    // Generate complete markdown
    const fullMarkdown = generateMarkdown(page, markdownContent, config);

    // Write to file
    await writeMarkdownFile(outputPath, fullMarkdown, config.dryRun);

    logger.success(`Generated: ${path.basename(outputPath)}`);
    return true;
  } catch (err) {
    logger.error(`Failed to generate file for page ${page.id}: ${err.message}`);
    return false;
  }
}

/**
 * Check if a file needs to be updated
 */
export async function needsUpdate(filePath, page) {
  try {
    // Check if file exists
    if (!await fs.exists(filePath)) {
      logger.debug(`File does not exist: ${filePath}`);
      return true;
    }

    // Get file modification time
    const stats = await fs.getStats(filePath);
    const fileModTime = stats.mtime;

    // Get page last edited time
    const pageModTime = new Date(page.last_edited_time);

    // File needs update if page was edited after file was modified
    const needsUpdate = pageModTime > fileModTime;

    if (needsUpdate) {
      logger.debug(
        `Page ${page.id} needs update: ` +
        `page modified ${pageModTime.toISOString()}, ` +
        `file modified ${fileModTime.toISOString()}`
      );
    } else {
      logger.debug(`Page ${page.id} is up to date`);
    }

    return needsUpdate;
  } catch (err) {
    logger.warn(`Failed to check if file needs update: ${err.message}`);
    return true; // Update if we can't determine
  }
}
