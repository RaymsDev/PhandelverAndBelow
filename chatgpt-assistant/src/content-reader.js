import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import yaml from 'yaml';

/**
 * Read all D&D content from the notion-import directory
 */
export class ContentReader {
  constructor(contentDir = '../notion-import') {
    this.contentDir = path.resolve(contentDir);
  }

  /**
   * Parse markdown file with YAML frontmatter
   */
  async parseMarkdownFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract YAML frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

      if (!frontmatterMatch) {
        return { content, metadata: {} };
      }

      const metadata = yaml.parse(frontmatterMatch[1]);
      const body = frontmatterMatch[2].trim();

      return {
        metadata,
        content: body,
        fullContent: content
      };
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Get all characters (PCs, NPCs, antagonists)
   */
  async getCharacters() {
    const pattern = path.join(this.contentDir, 'personnages/**/*.md');
    const files = await glob(pattern);

    const characters = [];
    for (const file of files) {
      const parsed = await this.parseMarkdownFile(file);
      if (parsed) {
        characters.push({
          ...parsed,
          filePath: file,
          category: this.getCategoryFromPath(file)
        });
      }
    }

    return characters;
  }

  /**
   * Get all locations
   */
  async getLocations() {
    const pattern = path.join(this.contentDir, 'lieux/**/*.md');
    const files = await glob(pattern);

    const locations = [];
    for (const file of files) {
      const parsed = await this.parseMarkdownFile(file);
      if (parsed) {
        locations.push({
          ...parsed,
          filePath: file
        });
      }
    }

    return locations;
  }

  /**
   * Get all adventures
   */
  async getAdventures() {
    const pattern = path.join(this.contentDir, 'adventures/**/*.md');
    const files = await glob(pattern);

    const adventures = [];
    for (const file of files) {
      const parsed = await this.parseMarkdownFile(file);
      if (parsed) {
        adventures.push({
          ...parsed,
          filePath: file
        });
      }
    }

    return adventures;
  }

  /**
   * Get all factions
   */
  async getFactions() {
    const pattern = path.join(this.contentDir, 'factions/**/*.md');
    const files = await glob(pattern);

    const factions = [];
    for (const file of files) {
      const parsed = await this.parseMarkdownFile(file);
      if (parsed) {
        factions.push({
          ...parsed,
          filePath: file
        });
      }
    }

    return factions;
  }

  /**
   * Get all sessions
   */
  async getSessions() {
    const pattern = path.join(this.contentDir, 'sessions/**/*.md');
    const files = await glob(pattern);

    const sessions = [];
    for (const file of files) {
      const parsed = await this.parseMarkdownFile(file);
      if (parsed) {
        sessions.push({
          ...parsed,
          filePath: file
        });
      }
    }

    return sessions;
  }

  /**
   * Get all content as a context object
   */
  async getAllContent() {
    const [characters, locations, adventures, factions, sessions] = await Promise.all([
      this.getCharacters(),
      this.getLocations(),
      this.getAdventures(),
      this.getFactions(),
      this.getSessions()
    ]);

    return {
      characters,
      locations,
      adventures,
      factions,
      sessions
    };
  }

  /**
   * Get category from file path
   */
  getCategoryFromPath(filePath) {
    const parts = filePath.split('/');
    const personnagesIndex = parts.indexOf('personnages');

    if (personnagesIndex !== -1 && parts.length > personnagesIndex + 1) {
      return parts[personnagesIndex + 1]; // joueurs, phandalin, antagonistes, etc.
    }

    return 'autres';
  }

  /**
   * Search content by name
   */
  async searchByName(name) {
    const allContent = await this.getAllContent();
    const searchTerm = name.toLowerCase();

    const results = {
      characters: allContent.characters.filter(c =>
        c.metadata?.nom?.toLowerCase().includes(searchTerm)
      ),
      locations: allContent.locations.filter(l =>
        l.metadata?.nom?.toLowerCase().includes(searchTerm)
      ),
      adventures: allContent.adventures.filter(a =>
        a.metadata?.nom?.toLowerCase().includes(searchTerm)
      )
    };

    return results;
  }

  /**
   * Format content for ChatGPT context
   */
  formatForContext(content, maxItems = 10) {
    let context = '# Campaign Content\n\n';

    if (content.characters?.length > 0) {
      context += '## Characters\n';
      content.characters.slice(0, maxItems).forEach(char => {
        context += `- **${char.metadata?.nom || 'Unknown'}**`;
        if (char.metadata?.race) context += ` (${char.metadata.race})`;
        if (char.metadata?.role) context += ` - ${char.metadata.role}`;
        context += '\n';
      });
      context += '\n';
    }

    if (content.locations?.length > 0) {
      context += '## Locations\n';
      content.locations.slice(0, maxItems).forEach(loc => {
        context += `- **${loc.metadata?.nom || 'Unknown'}**`;
        if (loc.metadata?.type) context += ` (${loc.metadata.type})`;
        context += '\n';
      });
      context += '\n';
    }

    if (content.adventures?.length > 0) {
      context += '## Adventures\n';
      content.adventures.slice(0, maxItems).forEach(adv => {
        context += `- ${adv.metadata?.nom || 'Unknown'}\n`;
      });
      context += '\n';
    }

    return context;
  }
}
