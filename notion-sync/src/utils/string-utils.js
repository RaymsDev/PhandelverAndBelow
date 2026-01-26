/**
 * String utilities for filename generation and sanitization
 */

/**
 * Convert a string to kebab-case
 * "Chateau de Cragmaw" → "chateau-de-cragmaw"
 * "Les Ombres de Nyx'ma" → "les-ombres-de-nyx-ma"
 */
export function toKebabCase(str) {
  return str
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[''']/g, '-') // Replace apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .replace(/-+/g, '-'); // Collapse multiple hyphens
}

/**
 * Sanitize a string for use in filenames
 * Remove or replace characters that are problematic in filenames
 */
export function sanitizeFilename(str) {
  return str
    .replace(/[/\\?%*:|"<>]/g, '-') // Replace illegal filename chars
    .replace(/\s+/g, '-') // Replace whitespace with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens
    .substring(0, 255); // Limit filename length
}

/**
 * Generate a unique filename if a conflict exists
 * "page.md" → "page-2.md" if "page.md" exists
 */
export function makeUnique(filename, existingFilenames) {
  if (!existingFilenames.includes(filename)) {
    return filename;
  }

  const parts = filename.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()}` : '';
  const base = parts.join('.');

  let counter = 2;
  let newFilename = `${base}-${counter}${ext}`;

  while (existingFilenames.includes(newFilename)) {
    counter++;
    newFilename = `${base}-${counter}${ext}`;
  }

  return newFilename;
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str, maxLength = 100, suffix = '...') {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Escape special characters for use in YAML
 */
export function escapeYaml(str) {
  if (typeof str !== 'string') {
    return str;
  }

  // Check if string needs quoting
  const needsQuotes = /[:#\[\]{}|>@`&*!,]/.test(str) ||
                      str.startsWith(' ') ||
                      str.endsWith(' ') ||
                      str.includes('\n');

  if (needsQuotes) {
    // Escape double quotes and backslashes
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }

  return str;
}
