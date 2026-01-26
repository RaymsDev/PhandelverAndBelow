/**
 * Notion blocks to Markdown converter
 * Uses notion-to-md library with custom transformers
 */
import { NotionToMarkdown } from 'notion-to-md';
import * as logger from '../utils/logger.js';

/**
 * Create a NotionToMarkdown instance with custom transformers
 */
export function createConverter(notionClient) {
  const n2m = new NotionToMarkdown({ notionClient: notionClient.client });

  // Custom transformer for callouts
  n2m.setCustomTransformer('callout', async (block) => {
    const { callout } = block;
    const emoji = callout.icon?.emoji || '💡';
    const text = callout.rich_text.map(t => t.plain_text).join('');

    return `> ${emoji} ${text}`;
  });

  // Custom transformer for toggle blocks
  n2m.setCustomTransformer('toggle', async (block) => {
    const { toggle } = block;
    const title = toggle.rich_text.map(t => t.plain_text).join('');

    // Convert to details/summary HTML
    return `<details>\n<summary>${title}</summary>\n\n${toggle.children || ''}\n</details>`;
  });

  return n2m;
}

/**
 * Convert a Notion page to markdown
 */
export async function convertPageToMarkdown(notionClient, pageId) {
  try {
    logger.debug(`Converting page ${pageId} to markdown`);

    const n2m = createConverter(notionClient);

    // Get markdown blocks
    const mdBlocks = await n2m.pageToMarkdown(pageId);

    // Convert blocks to markdown string
    const markdown = n2m.toMarkdownString(mdBlocks);

    // Return the parent property (markdown string)
    const mdString = markdown.parent || markdown;

    logger.debug(`Converted page ${pageId} (${mdString.length} characters)`);

    return mdString;
  } catch (err) {
    logger.error(`Failed to convert page ${pageId} to markdown: ${err.message}`);
    throw err;
  }
}

/**
 * Clean up markdown output
 * - Remove excessive newlines
 * - Normalize heading levels
 * - Fix list indentation
 */
export function cleanMarkdown(markdown) {
  let cleaned = markdown;

  // Remove more than 2 consecutive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Ensure single newline before headings
  cleaned = cleaned.replace(/\n+(#{1,6}\s)/g, '\n\n$1');

  // Ensure single newline after headings
  cleaned = cleaned.replace(/(#{1,6}\s.*)\n+/g, '$1\n\n');

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim();

  // Ensure file ends with single newline
  cleaned += '\n';

  return cleaned;
}

/**
 * Convert blocks to markdown with additional processing
 */
export async function blocksToMarkdown(notionClient, pageId) {
  const markdown = await convertPageToMarkdown(notionClient, pageId);
  return cleanMarkdown(markdown);
}
