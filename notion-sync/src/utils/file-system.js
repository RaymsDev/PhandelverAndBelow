/**
 * File system utilities
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
    return true;
  }
}

/**
 * Check if a file or directory exists
 */
export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file as text
 */
export async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Write text to a file
 */
export async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    throw new Error(`Failed to write file ${filePath}: ${err.message}`);
  }
}

/**
 * Read a JSON file
 */
export async function readJSON(filePath) {
  try {
    const content = await readFile(filePath);
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read JSON file ${filePath}: ${err.message}`);
  }
}

/**
 * Write a JSON file with pretty formatting
 */
export async function writeJSON(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    await writeFile(filePath, content);
    return true;
  } catch (err) {
    throw new Error(`Failed to write JSON file ${filePath}: ${err.message}`);
  }
}

/**
 * List files in a directory
 */
export async function listFiles(dirPath, extension = null) {
  try {
    const files = await fs.readdir(dirPath);

    if (extension) {
      return files.filter(f => f.endsWith(extension));
    }

    return files;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

/**
 * Get file stats (modified time, size, etc.)
 */
export async function getStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (err) {
    return null;
  }
}

/**
 * Get file modified time as ISO string
 */
export async function getModifiedTime(filePath) {
  const stats = await getStats(filePath);
  return stats ? stats.mtime.toISOString() : null;
}

/**
 * Resolve a path relative to the project root
 */
export function resolveProjectPath(...segments) {
  // Go up from src/utils to project root
  const projectRoot = path.resolve(__dirname, '../..');
  return path.resolve(projectRoot, ...segments);
}

/**
 * Copy a file
 */
export async function copyFile(source, destination) {
  try {
    await fs.copyFile(source, destination);
    return true;
  } catch (err) {
    throw new Error(`Failed to copy file from ${source} to ${destination}: ${err.message}`);
  }
}

/**
 * Delete a file
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false; // File doesn't exist
    }
    throw err;
  }
}

/**
 * List all files recursively in a directory
 */
export async function listFilesRecursive(dirPath, extension = null) {
  const results = [];

  async function walk(dir) {
    const files = await fs.readdir(dir, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        await walk(filePath);
      } else if (!extension || file.name.endsWith(extension)) {
        results.push(filePath);
      }
    }
  }

  try {
    await walk(dirPath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  return results;
}
