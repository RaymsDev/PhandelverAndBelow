#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { ChatGPTClient } from './chatgpt-client.js';
import { ContentReader } from './content-reader.js';
import readline from 'readline';

// Load environment variables
dotenv.config();

const program = new Command();

// Validate API key
function validateApiKey() {
  if (!process.env.CHATGPT_API_KEY) {
    console.error(chalk.red('Error: CHATGPT_API_KEY not found in .env file'));
    console.log(chalk.yellow('\nRun: npm run init'));
    console.log(chalk.yellow('Then edit .env and add your API key from https://platform.openai.com/api-keys'));
    process.exit(1);
  }
}

// Get content directory
function getContentDir() {
  return process.env.CONTENT_DIR || '../notion-import';
}

// Get ChatGPT model
function getModel() {
  return process.env.CHATGPT_MODEL || 'gpt-4-turbo-preview';
}

// Interactive chat mode
async function interactiveChat() {
  validateApiKey();

  console.log(chalk.bold.cyan('\n🎲 D&D ChatGPT Assistant - Interactive Mode\n'));
  console.log(chalk.gray('Loading campaign content...'));

  const contentReader = new ContentReader(getContentDir());
  const allContent = await contentReader.getAllContent();
  const campaignContext = contentReader.formatForContext(allContent);

  console.log(chalk.green('✓ Campaign content loaded'));
  console.log(chalk.gray(`  - ${allContent.characters.length} characters`));
  console.log(chalk.gray(`  - ${allContent.locations.length} locations`));
  console.log(chalk.gray(`  - ${allContent.adventures.length} adventures`));
  console.log(chalk.gray(`  - ${allContent.factions.length} factions`));
  console.log(chalk.gray(`  - ${allContent.sessions.length} sessions\n`));

  const client = new ChatGPTClient(process.env.CHATGPT_API_KEY, getModel());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(chalk.yellow('Type your questions or requests. Type "exit" to quit, "clear" to clear history.\n'));

  const askQuestion = () => {
    rl.question(chalk.bold.blue('You: '), async (input) => {
      const message = input.trim();

      if (message.toLowerCase() === 'exit') {
        console.log(chalk.green('\nGoodbye! Happy gaming! 🎲\n'));
        rl.close();
        return;
      }

      if (message.toLowerCase() === 'clear') {
        client.clearHistory();
        console.log(chalk.yellow('\nConversation history cleared.\n'));
        askQuestion();
        return;
      }

      if (!message) {
        askQuestion();
        return;
      }

      try {
        const response = await client.chat(message, campaignContext);
        client.displayResponse(response);
        console.log('\n');
      } catch (error) {
        console.error(chalk.red('\nError:'), error.message);
        console.log('\n');
      }

      askQuestion();
    });
  };

  askQuestion();
}

// CLI Commands
program
  .name('dnd-chatgpt')
  .description('ChatGPT assistant for D&D session preparation')
  .version('1.0.0');

program
  .command('chat')
  .description('Interactive chat mode with campaign context')
  .action(interactiveChat);

program
  .command('prep')
  .description('Prepare a session')
  .argument('[description]', 'Session description or goals')
  .action(async (description) => {
    validateApiKey();

    const sessionInfo = description || 'Next session of Phandelver and Below campaign';

    console.log(chalk.bold.cyan('\n🎲 Session Preparation Assistant\n'));
    console.log(chalk.gray('Loading campaign content...'));

    const contentReader = new ContentReader(getContentDir());
    const allContent = await contentReader.getAllContent();
    const campaignContext = contentReader.formatForContext(allContent);

    console.log(chalk.green('✓ Campaign content loaded\n'));

    const client = new ChatGPTClient(process.env.CHATGPT_API_KEY, getModel());

    try {
      const response = await client.prepareSession(sessionInfo, campaignContext);
      client.displayResponse(response);
    } catch (error) {
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program
  .command('npc')
  .description('Generate an NPC')
  .argument('<description>', 'NPC description (e.g., "a suspicious merchant in Phandalin")')
  .action(async (description) => {
    validateApiKey();

    console.log(chalk.bold.cyan('\n🎭 NPC Generator\n'));
    console.log(chalk.gray('Loading campaign content...'));

    const contentReader = new ContentReader(getContentDir());
    const allContent = await contentReader.getAllContent();
    const campaignContext = contentReader.formatForContext(allContent);

    console.log(chalk.green('✓ Campaign content loaded\n'));

    const client = new ChatGPTClient(process.env.CHATGPT_API_KEY, getModel());

    try {
      const response = await client.generateNPC(description, campaignContext);
      client.displayResponse(response);
    } catch (error) {
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program
  .command('encounter')
  .description('Create an encounter')
  .argument('<description>', 'Encounter description')
  .option('-l, --level <number>', 'Party level', '3')
  .action(async (description, options) => {
    validateApiKey();

    console.log(chalk.bold.cyan('\n⚔️  Encounter Designer\n'));
    console.log(chalk.gray('Loading campaign content...'));

    const contentReader = new ContentReader(getContentDir());
    const allContent = await contentReader.getAllContent();
    const campaignContext = contentReader.formatForContext(allContent);

    console.log(chalk.green('✓ Campaign content loaded\n'));

    const client = new ChatGPTClient(process.env.CHATGPT_API_KEY, getModel());

    try {
      const response = await client.createEncounter(
        description,
        parseInt(options.level),
        campaignContext
      );
      client.displayResponse(response);
    } catch (error) {
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program
  .command('lore')
  .description('Get lore and world-building details')
  .argument('<question>', 'Lore question')
  .action(async (question) => {
    validateApiKey();

    console.log(chalk.bold.cyan('\n📜 Lore Keeper\n'));
    console.log(chalk.gray('Loading campaign content...'));

    const contentReader = new ContentReader(getContentDir());
    const allContent = await contentReader.getAllContent();
    const campaignContext = contentReader.formatForContext(allContent);

    console.log(chalk.green('✓ Campaign content loaded\n'));

    const client = new ChatGPTClient(process.env.CHATGPT_API_KEY, getModel());

    try {
      const response = await client.getLore(question, campaignContext);
      client.displayResponse(response);
    } catch (error) {
      console.error(chalk.red('\nError:'), error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List campaign content')
  .option('-c, --characters', 'List characters')
  .option('-l, --locations', 'List locations')
  .option('-a, --adventures', 'List adventures')
  .option('-f, --factions', 'List factions')
  .action(async (options) => {
    console.log(chalk.bold.cyan('\n📚 Campaign Content\n'));

    const contentReader = new ContentReader(getContentDir());
    const allContent = await contentReader.getAllContent();

    const showAll = !options.characters && !options.locations && !options.adventures && !options.factions;

    if (showAll || options.characters) {
      console.log(chalk.bold.green('Characters:'));
      allContent.characters.forEach(char => {
        const name = char.metadata?.nom || 'Unknown';
        const race = char.metadata?.race || '';
        const role = char.metadata?.role || '';
        console.log(chalk.gray(`  • ${name}${race ? ` (${race})` : ''}${role ? ` - ${role}` : ''}`));
      });
      console.log('');
    }

    if (showAll || options.locations) {
      console.log(chalk.bold.green('Locations:'));
      allContent.locations.forEach(loc => {
        const name = loc.metadata?.nom || 'Unknown';
        const type = loc.metadata?.type || '';
        console.log(chalk.gray(`  • ${name}${type ? ` (${type})` : ''}`));
      });
      console.log('');
    }

    if (showAll || options.adventures) {
      console.log(chalk.bold.green('Adventures:'));
      allContent.adventures.forEach(adv => {
        const name = adv.metadata?.nom || 'Unknown';
        console.log(chalk.gray(`  • ${name}`));
      });
      console.log('');
    }

    if (showAll || options.factions) {
      console.log(chalk.bold.green('Factions:'));
      allContent.factions.forEach(fac => {
        const name = fac.metadata?.nom || 'Unknown';
        console.log(chalk.gray(`  • ${name}`));
      });
      console.log('');
    }
  });

// Default action: interactive chat
program.action(interactiveChat);

program.parse();
