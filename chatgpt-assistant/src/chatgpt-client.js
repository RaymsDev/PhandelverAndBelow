import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';

/**
 * ChatGPT client for D&D session preparation
 */
export class ChatGPTClient {
  constructor(apiKey, model = 'gpt-4-turbo-preview') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
    this.conversationHistory = [];
  }

  /**
   * Send a message to ChatGPT with campaign context
   */
  async chat(userMessage, campaignContext = '', systemPrompt = null) {
    const spinner = ora('Consulting ChatGPT...').start();

    try {
      const messages = [];

      // System prompt
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      } else {
        messages.push({
          role: 'system',
          content: this.getDefaultSystemPrompt()
        });
      }

      // Add campaign context if provided
      if (campaignContext) {
        messages.push({
          role: 'system',
          content: `Campaign Context:\n${campaignContext}`
        });
      }

      // Add conversation history
      messages.push(...this.conversationHistory);

      // Add user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      const assistantMessage = response.choices[0].message.content;

      // Update conversation history
      this.conversationHistory.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      spinner.succeed('Response received');

      return {
        message: assistantMessage,
        usage: response.usage
      };
    } catch (error) {
      spinner.fail('Error communicating with ChatGPT');
      throw error;
    }
  }

  /**
   * Default system prompt for D&D session preparation
   */
  getDefaultSystemPrompt() {
    return `You are an expert Dungeon Master assistant for D&D 5th Edition. You are helping prepare sessions for the "Phandelver and Below: The Shattered Obelisk" campaign.

Your role is to:
- Help prepare engaging D&D sessions
- Generate NPCs with personalities and motivations
- Create balanced encounters appropriate for the party level
- Develop interesting plot hooks and story elements
- Provide lore and world-building details
- Suggest creative solutions to DM challenges

Always keep responses practical and actionable for the DM. Use the campaign context provided to ensure consistency with the existing story and characters.`;
  }

  /**
   * Prepare a session
   */
  async prepareSession(sessionInfo, campaignContext) {
    const systemPrompt = `You are a D&D session preparation assistant. Help the DM create a detailed session plan including:
- Session objectives and goals
- Key scenes and encounters
- NPC interactions
- Potential complications or twists
- Treasure and rewards
- Session flow and pacing notes

Format your response in a clear, organized markdown structure.`;

    return await this.chat(
      `Help me prepare a D&D session with the following info:\n${sessionInfo}`,
      campaignContext,
      systemPrompt
    );
  }

  /**
   * Generate an NPC
   */
  async generateNPC(npcDescription, campaignContext) {
    const systemPrompt = `You are an NPC generator for D&D. Create detailed NPCs with:
- Name and basic description
- Personality traits and quirks
- Motivations and goals
- Secrets or interesting backstory
- Stat block suggestions (if relevant)
- Roleplaying tips for the DM

Make NPCs memorable and engaging for players.`;

    return await this.chat(
      `Create an NPC: ${npcDescription}`,
      campaignContext,
      systemPrompt
    );
  }

  /**
   * Create an encounter
   */
  async createEncounter(encounterDescription, partyLevel, campaignContext) {
    const systemPrompt = `You are a D&D encounter designer. Create balanced encounters with:
- Enemy composition and tactics
- Terrain and environmental features
- Potential complications or twists
- Treasure or rewards
- XP calculation
- Difficulty rating

Ensure encounters are challenging but fair for the party level.`;

    return await this.chat(
      `Create a level ${partyLevel} encounter: ${encounterDescription}`,
      campaignContext,
      systemPrompt
    );
  }

  /**
   * Get lore or world-building details
   */
  async getLore(loreQuestion, campaignContext) {
    const systemPrompt = `You are a D&D lore keeper and world-builder. Provide:
- Detailed lore consistent with D&D canon
- Creative world-building ideas
- Historical context and connections
- Potential plot hooks from the lore

Keep answers engaging and usable at the table.`;

    return await this.chat(
      loreQuestion,
      campaignContext,
      systemPrompt
    );
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Display formatted response
   */
  displayResponse(response) {
    console.log('\n' + chalk.cyan('═'.repeat(80)));
    console.log(chalk.bold.green('\nChatGPT Response:\n'));
    console.log(response.message);
    console.log('\n' + chalk.cyan('═'.repeat(80)));

    if (response.usage) {
      console.log(chalk.gray(`\nTokens used: ${response.usage.total_tokens} (prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens})`));
    }
  }
}
