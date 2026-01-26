# ChatGPT D&D Assistant

An intelligent ChatGPT-powered assistant for preparing D&D sessions using your Phandelver and Below campaign data.

## Features

- **Session Preparation**: Get detailed session plans with encounters, plot hooks, and pacing
- **NPC Generation**: Create memorable NPCs with personalities, motivations, and secrets
- **Encounter Design**: Generate balanced encounters appropriate for your party level
- **Lore & World-Building**: Get detailed lore and creative world-building ideas
- **Interactive Chat**: Have conversations with ChatGPT using your campaign context
- **Campaign Integration**: Automatically loads all your characters, locations, and adventures

## Prerequisites

- Node.js v24 (see parent directory `.nvmrc`)
- OpenAI API key (ChatGPT)
- Campaign content in `../notion-import/` directory

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

```bash
# Initialize .env file
npm run init

# Edit .env and add your ChatGPT API key
# Get your key from: https://platform.openai.com/api-keys
```

Your `.env` should look like:
```env
CHATGPT_API_KEY=sk-proj-your-api-key-here
CONTENT_DIR=../notion-import
CHATGPT_MODEL=gpt-4-turbo-preview
```

### 3. Run the Assistant

```bash
# Interactive chat mode (recommended)
npm start

# Or specific commands
npm run prep "Next session planning"
npm run npc "mysterious merchant"
npm run encounter "goblin ambush" --level 3
npm run lore "What is Wave Echo Cave?"
```

## Usage

### Interactive Chat Mode (Recommended)

Start an interactive conversation with campaign context:

```bash
npm start
# or
npm run chat
```

Example conversation:
```
You: I need to plan my next session. The party just cleared the Redbrand hideout.
ChatGPT: [Provides session structure and ideas]

You: They're level 3. What encounters should I prepare?
ChatGPT: [Suggests level-appropriate encounters]

You: I like the Cragmaw Castle idea. Develop that for me.
ChatGPT: [Provides detailed castle exploration plan]
```

Type `exit` to quit, `clear` to clear conversation history.

### Command-Line Mode

#### Prepare a Session

```bash
npm run prep
# or with specific description
npm run prep "The party investigates rumors of undead in Thundertree"
```

Generates:
- Session objectives
- Key scenes and encounters
- NPC interactions
- Potential twists
- Treasure and rewards
- Pacing notes

#### Generate an NPC

```bash
npm run npc "a suspicious merchant selling maps at the Stonehill Inn"
```

Generates:
- Name and description
- Personality traits and quirks
- Motivations and goals
- Secrets and backstory
- Stat block suggestions
- Roleplaying tips

#### Create an Encounter

```bash
npm run encounter "ambush by Cragmaw goblins" --level 2
npm run encounter "exploring Wave Echo Cave" --level 4
```

Generates:
- Enemy composition and tactics
- Terrain features
- Complications or twists
- Treasure/rewards
- XP calculation
- Difficulty rating

#### Get Lore & World-Building

```bash
npm run lore "What is the history of the Phandelver Pact?"
npm run lore "Why are drow in this region?"
```

Generates:
- Detailed lore consistent with D&D canon
- World-building ideas
- Historical context
- Plot hooks from the lore

### List Campaign Content

```bash
# List all content
npm run list

# List specific types
npm run list --characters
npm run list --locations
npm run list --adventures
npm run list --factions
```

## How It Works

### Campaign Context Loading

The assistant automatically loads your campaign content from the `notion-import` directory:

- **Characters**: All PCs, NPCs, antagonists from `personnages/`
- **Locations**: Towns, dungeons, landmarks from `lieux/`
- **Adventures**: Past and planned adventures from `adventures/`
- **Factions**: Organizations and groups from `factions/`
- **Sessions**: Previous session notes from `sessions/`

This context is included with every ChatGPT request to ensure consistent, relevant responses.

### Content Reader

The `ContentReader` class:
- Parses Markdown files with YAML frontmatter
- Organizes content by type
- Formats context for ChatGPT
- Provides search functionality

### ChatGPT Client

The `ChatGPTClient` class:
- Manages conversations with OpenAI API
- Maintains conversation history
- Uses specialized system prompts for different tasks
- Handles error recovery and retries

## Configuration

### Environment Variables

Edit `.env` to customize:

```env
# Required: Your OpenAI API key
CHATGPT_API_KEY=sk-proj-xxxxx

# Optional: Content directory (default: ../notion-import)
CONTENT_DIR=../notion-import

# Optional: ChatGPT model (default: gpt-4-turbo-preview)
CHATGPT_MODEL=gpt-4-turbo-preview
```

### Model Selection

Choose based on your needs:

- `gpt-4-turbo-preview` (default): Most capable, best for complex planning
- `gpt-4`: Reliable, high-quality responses
- `gpt-3.5-turbo`: Faster, cheaper, good for simple tasks

### Cost Considerations

Approximate costs (as of 2024):
- `gpt-4-turbo-preview`: ~$0.01-0.03 per session prep request
- `gpt-3.5-turbo`: ~$0.001-0.003 per request

Monitor your usage at: https://platform.openai.com/usage

## Architecture

```
chatgpt-assistant/
├── src/
│   ├── index.js              # CLI entry point with commands
│   ├── chatgpt-client.js     # OpenAI API wrapper
│   └── content-reader.js     # Campaign content loader
├── package.json              # Dependencies and scripts
├── .env                      # Configuration (not committed)
├── .env.example              # Configuration template
├── README.md                 # This file
└── EXAMPLES.md               # Detailed usage examples
```

## Examples

See [EXAMPLES.md](EXAMPLES.md) for comprehensive examples including:

- Session preparation scenarios
- NPC generation templates
- Encounter design patterns
- Lore question examples
- Interactive chat workflows
- Advanced prompting techniques

## Troubleshooting

### "CHATGPT_API_KEY not found"

Run `npm run init` and edit `.env` to add your API key.

Get your key from: https://platform.openai.com/api-keys

### "No campaign content found"

Make sure you've synced your Notion content:

```bash
cd ../notion-sync
npm run sync
```

### "Rate limit exceeded"

You're making too many requests. Wait a minute and try again.

Consider using `gpt-3.5-turbo` for faster rate limits.

### "Invalid API key"

Check that your API key in `.env` is correct and active.

Verify at: https://platform.openai.com/api-keys

### Content not loading

Check that `CONTENT_DIR` in `.env` points to the correct directory.

Default is `../notion-import`

## Best Practices

### Effective Prompting

1. **Be specific**: Include party level, location, and context
2. **Reference campaign content**: Mention known NPCs, locations, plots
3. **Define needs**: Specify combat, roleplay, puzzle, exploration
4. **Iterate**: Use chat mode to refine ideas with follow-ups
5. **Request format**: Ask for specific output (stat blocks, bullet lists, etc.)

### Session Preparation Workflow

1. **Review last session**: What happened? Where did they end?
2. **Use chat mode**: Brainstorm next session interactively
3. **Generate NPCs**: Create any new characters needed
4. **Design encounters**: Plan combat and challenges
5. **Check lore**: Verify consistency with campaign
6. **List content**: Review available characters/locations

### Cost Management

- Use `gpt-3.5-turbo` for simple requests
- Use `gpt-4-turbo-preview` for complex planning
- Clear conversation history when starting new topics
- Be concise in prompts to reduce token usage

## Integration with Notion Sync

This tool works seamlessly with the `notion-sync` tool:

```bash
# Sync latest campaign data from Notion
cd ../notion-sync
npm run sync

# Use updated data with ChatGPT
cd ../chatgpt-assistant
npm start
```

## Security

**Important**: Never commit `.env` file!

The `.env` file contains your API key and should remain private.

- ✅ `.env.example` is committed (template)
- ❌ `.env` is gitignored (your actual keys)

## Contributing

This tool is part of the PhandelverAndBelow campaign management system.

To improve it:
1. Test with your own sessions
2. Share useful prompts and patterns
3. Report issues or suggestions
4. Contribute code improvements

## API Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [ChatGPT Models](https://platform.openai.com/docs/models)
- [OpenAI Node.js SDK](https://github.com/openai/openai-node)

## D&D Resources

- [D&D Beyond](https://www.dndbeyond.com/)
- [Phandelver and Below Module](https://www.dndbeyond.com/sources/phandelver)
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)

## License

MIT License - Part of the PhandelverAndBelow campaign management system.

## Support

For issues or questions:
- Check [EXAMPLES.md](EXAMPLES.md) for usage examples
- Review this README for configuration help
- Check OpenAI status: https://status.openai.com/

---

**Version**: 1.0.0
**Author**: PhandelverAndBelow Campaign Team
**Last Updated**: 2026-01-26
