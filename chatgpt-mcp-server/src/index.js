#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
});

const MODEL = process.env.CHATGPT_MODEL || 'gpt-4-turbo-preview';
const CONTENT_DIR = path.resolve(__dirname, process.env.CONTENT_DIR || '../../notion-import');

// Conversation history storage
const conversations = new Map();

/**
 * Load campaign context from markdown files
 */
async function loadCampaignContext() {
  try {
    const context = {
      characters: [],
      locations: [],
      adventures: [],
    };

    // Load characters
    const personnagesDir = path.join(CONTENT_DIR, 'personnages');
    const characterFiles = await findMarkdownFiles(personnagesDir);
    for (const file of characterFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const name = extractName(content);
      if (name) {
        context.characters.push(name);
      }
    }

    // Load locations
    const lieuxDir = path.join(CONTENT_DIR, 'lieux');
    const locationFiles = await findMarkdownFiles(lieuxDir);
    for (const file of locationFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const name = extractName(content);
      if (name) {
        context.locations.push(name);
      }
    }

    // Load adventures
    const adventuresDir = path.join(CONTENT_DIR, 'adventures');
    const adventureFiles = await findMarkdownFiles(adventuresDir);
    for (const file of adventureFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const name = extractName(content);
      if (name) {
        context.adventures.push(name);
      }
    }

    return context;
  } catch (error) {
    console.error('Error loading campaign context:', error);
    return { characters: [], locations: [], adventures: [] };
  }
}

/**
 * Find all markdown files recursively
 */
async function findMarkdownFiles(dir) {
  const files = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await findMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  return files;
}

/**
 * Extract name from YAML frontmatter
 */
function extractName(content) {
  const match = content.match(/nom:\s*"?([^"\n]+)"?/);
  return match ? match[1] : null;
}

/**
 * Format campaign context for ChatGPT
 */
function formatCampaignContext(context) {
  let formatted = '\n\n# Campaign Context\n\n';

  if (context.characters.length > 0) {
    formatted += `**Characters**: ${context.characters.slice(0, 20).join(', ')}`;
    if (context.characters.length > 20) {
      formatted += `, and ${context.characters.length - 20} more`;
    }
    formatted += '\n\n';
  }

  if (context.locations.length > 0) {
    formatted += `**Locations**: ${context.locations.join(', ')}\n\n`;
  }

  if (context.adventures.length > 0) {
    formatted += `**Adventures**: ${context.adventures.slice(0, 10).join(', ')}`;
    if (context.adventures.length > 10) {
      formatted += `, and ${context.adventures.length - 10} more`;
    }
    formatted += '\n\n';
  }

  return formatted;
}

/**
 * Call ChatGPT with system prompt and conversation history
 */
async function callChatGPT(prompt, systemPrompt, conversationId = null) {
  const messages = [];

  // Add system prompt
  messages.push({
    role: 'system',
    content: systemPrompt,
  });

  // Add conversation history if exists
  if (conversationId && conversations.has(conversationId)) {
    messages.push(...conversations.get(conversationId));
  }

  // Add user message
  messages.push({
    role: 'user',
    content: prompt,
  });

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  const assistantMessage = response.choices[0].message.content;

  // Store conversation history
  if (conversationId) {
    if (!conversations.has(conversationId)) {
      conversations.set(conversationId, []);
    }
    conversations.get(conversationId).push(
      { role: 'user', content: prompt },
      { role: 'assistant', content: assistantMessage }
    );
  }

  return {
    response: assistantMessage,
    usage: {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    },
  };
}

// Create MCP server
const server = new Server(
  {
    name: 'chatgpt-dnd-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Load campaign context at startup
const campaignContext = await loadCampaignContext();
const campaignContextStr = formatCampaignContext(campaignContext);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'chatgpt_prepare_session',
        description: 'Use ChatGPT to prepare a D&D session with detailed plans, encounters, and plot hooks',
        inputSchema: {
          type: 'object',
          properties: {
            session_description: {
              type: 'string',
              description: 'Description of the session to prepare (goals, location, party level, etc.)',
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to maintain context across multiple calls',
            },
          },
          required: ['session_description'],
        },
      },
      {
        name: 'chatgpt_generate_npc',
        description: 'Use ChatGPT to generate a detailed NPC with personality, motivations, and secrets',
        inputSchema: {
          type: 'object',
          properties: {
            npc_description: {
              type: 'string',
              description: 'Description of the NPC to generate (role, location, personality hints)',
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to maintain context',
            },
          },
          required: ['npc_description'],
        },
      },
      {
        name: 'chatgpt_create_encounter',
        description: 'Use ChatGPT to design a balanced combat or challenge encounter',
        inputSchema: {
          type: 'object',
          properties: {
            encounter_description: {
              type: 'string',
              description: 'Description of the encounter (enemies, location, challenges)',
            },
            party_level: {
              type: 'number',
              description: 'Party level (1-20)',
              default: 3,
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to maintain context',
            },
          },
          required: ['encounter_description'],
        },
      },
      {
        name: 'chatgpt_get_lore',
        description: 'Use ChatGPT to get D&D lore, world-building details, or answer setting questions',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'Lore question or world-building request',
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to maintain context',
            },
          },
          required: ['question'],
        },
      },
      {
        name: 'chatgpt_chat',
        description: 'General purpose chat with ChatGPT about D&D campaign planning and DMing',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Your message or question to ChatGPT',
            },
            conversation_id: {
              type: 'string',
              description: 'Optional conversation ID to maintain context across messages',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'chatgpt_clear_conversation',
        description: 'Clear conversation history for a given conversation ID',
        inputSchema: {
          type: 'object',
          properties: {
            conversation_id: {
              type: 'string',
              description: 'Conversation ID to clear',
            },
          },
          required: ['conversation_id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'chatgpt_prepare_session': {
        const systemPrompt = `You are a D&D session preparation assistant for "Phandelver and Below: The Shattered Obelisk". Help the DM create a detailed session plan including:
- Session objectives and goals
- Key scenes and encounters
- NPC interactions
- Potential complications or twists
- Treasure and rewards
- Session flow and pacing notes

Format your response in clear, organized markdown.${campaignContextStr}`;

        const result = await callChatGPT(
          args.session_description,
          systemPrompt,
          args.conversation_id
        );

        return {
          content: [
            {
              type: 'text',
              text: result.response,
            },
          ],
        };
      }

      case 'chatgpt_generate_npc': {
        const systemPrompt = `You are an NPC generator for D&D. Create detailed NPCs with:
- Name and basic description
- Personality traits and quirks
- Motivations and goals
- Secrets or interesting backstory
- Stat block suggestions (if relevant)
- Roleplaying tips for the DM

Make NPCs memorable and engaging for players.${campaignContextStr}`;

        const result = await callChatGPT(
          `Create an NPC: ${args.npc_description}`,
          systemPrompt,
          args.conversation_id
        );

        return {
          content: [
            {
              type: 'text',
              text: result.response,
            },
          ],
        };
      }

      case 'chatgpt_create_encounter': {
        const partyLevel = args.party_level || 3;
        const systemPrompt = `You are a D&D encounter designer. Create balanced encounters with:
- Enemy composition and tactics
- Terrain and environmental features
- Potential complications or twists
- Treasure or rewards
- XP calculation
- Difficulty rating

Ensure encounters are challenging but fair for party level ${partyLevel}.${campaignContextStr}`;

        const result = await callChatGPT(
          `Create a level ${partyLevel} encounter: ${args.encounter_description}`,
          systemPrompt,
          args.conversation_id
        );

        return {
          content: [
            {
              type: 'text',
              text: result.response,
            },
          ],
        };
      }

      case 'chatgpt_get_lore': {
        const systemPrompt = `You are a D&D lore keeper and world-builder for "Phandelver and Below". Provide:
- Detailed lore consistent with D&D canon
- Creative world-building ideas
- Historical context and connections
- Potential plot hooks from the lore

Keep answers engaging and usable at the table.${campaignContextStr}`;

        const result = await callChatGPT(
          args.question,
          systemPrompt,
          args.conversation_id
        );

        return {
          content: [
            {
              type: 'text',
              text: result.response,
            },
          ],
        };
      }

      case 'chatgpt_chat': {
        const systemPrompt = `You are an expert Dungeon Master assistant for D&D 5th Edition, specifically for "Phandelver and Below: The Shattered Obelisk" campaign.

Help with:
- Session preparation and planning
- NPC creation and development
- Encounter design and balancing
- Plot development and hooks
- Lore and world-building
- Creative DM solutions

Always keep responses practical and actionable.${campaignContextStr}`;

        const result = await callChatGPT(
          args.message,
          systemPrompt,
          args.conversation_id
        );

        return {
          content: [
            {
              type: 'text',
              text: result.response,
            },
          ],
        };
      }

      case 'chatgpt_clear_conversation': {
        if (conversations.has(args.conversation_id)) {
          conversations.delete(args.conversation_id);
          return {
            content: [
              {
                type: 'text',
                text: `Conversation history cleared for ID: ${args.conversation_id}`,
              },
            ],
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `No conversation found with ID: ${args.conversation_id}`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ChatGPT MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
