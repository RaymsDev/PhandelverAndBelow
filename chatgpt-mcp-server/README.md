# ChatGPT MCP Server for D&D

An MCP (Model Context Protocol) server that exposes ChatGPT as tools for Claude Code, enabling you to use both AI assistants together for D&D session preparation.

## What is This?

This MCP server allows **Claude Code** to call **ChatGPT** as a tool. When you're working with Claude in VS Code, you can ask Claude to use ChatGPT for specific tasks like:

- Session preparation
- NPC generation
- Encounter design
- Lore questions
- General D&D advice

The server automatically includes your campaign context (characters, locations, adventures) in every ChatGPT request.

## Architecture

```
Claude Code (VS Code)
    ↓
MCP Protocol
    ↓
ChatGPT MCP Server (this project)
    ↓
OpenAI API (ChatGPT)
```

## Installation

### 1. Dependencies Already Installed

Dependencies were installed automatically. If you need to reinstall:

```bash
cd chatgpt-mcp-server
npm install
```

### 2. Configuration

Your `.env` file is already configured with your ChatGPT API key.

Verify:
```bash
cat .env | grep CHATGPT_API_KEY
```

### 3. MCP Server Registration

The server is already registered in [../.mcp.json](../.mcp.json):

```json
{
  "mcpServers": {
    "chatgpt": {
      "command": "/home/remy.laffuge/repos/PhandelverAndBelow/chatgpt-mcp-server/mcp-chatgpt-wrapper.sh",
      "args": []
    }
  }
}
```

### 4. Restart VS Code

For the MCP server to be recognized:

1. Close VS Code completely
2. Reopen the PhandelverAndBelow project
3. The ChatGPT MCP server will start automatically

## Available Tools

When working with Claude, you can ask it to use these ChatGPT tools:

### 1. `chatgpt_prepare_session`

Prepare a detailed D&D session plan.

**Example prompts for Claude:**
```
"Use ChatGPT to prepare my next session where the party explores Cragmaw Castle"
"Ask ChatGPT to help me plan a session around investigating the Redbrand hideout"
```

### 2. `chatgpt_generate_npc`

Generate a detailed NPC with personality and backstory.

**Example prompts for Claude:**
```
"Use ChatGPT to create a mysterious merchant NPC for Phandalin"
"Ask ChatGPT to generate a villain lieutenant for the Black Spider"
```

### 3. `chatgpt_create_encounter`

Design a balanced encounter for your party.

**Example prompts for Claude:**
```
"Use ChatGPT to create a level 3 encounter with goblins in a forest"
"Ask ChatGPT to design a combat encounter in Wave Echo Cave for level 4 party"
```

### 4. `chatgpt_get_lore`

Get D&D lore and world-building details.

**Example prompts for Claude:**
```
"Use ChatGPT to explain the history of the Phandelver Pact"
"Ask ChatGPT about drow society and motivations"
```

### 5. `chatgpt_chat`

General purpose chat with ChatGPT.

**Example prompts for Claude:**
```
"Use ChatGPT to brainstorm ideas for my next session"
"Ask ChatGPT how to handle a player who wants to craft magic items"
```

### 6. `chatgpt_clear_conversation`

Clear conversation history.

**Example prompts for Claude:**
```
"Clear the ChatGPT conversation history for session-123"
```

## Conversation History

The MCP server maintains conversation history across multiple calls. Use a `conversation_id` to keep context:

**Example workflow with Claude:**
```
You: Use ChatGPT to prepare a session, use conversation ID "session-5"
Claude: [calls chatgpt_prepare_session with conversation_id: "session-5"]

You: Now ask ChatGPT to create NPCs for that session, same conversation
Claude: [calls chatgpt_generate_npc with conversation_id: "session-5"]

You: Ask ChatGPT to add encounters, same conversation
Claude: [calls chatgpt_create_encounter with conversation_id: "session-5"]
```

ChatGPT will remember the context from previous calls in the same conversation.

## Campaign Context

The server automatically loads your campaign content:

- **Characters** from `../notion-import/personnages/`
- **Locations** from `../notion-import/lieux/`
- **Adventures** from `../notion-import/adventures/`

This context is included with every ChatGPT request, ensuring responses are consistent with your campaign.

To update the content, sync from Notion:
```bash
cd ../notion-sync
npm run sync
```

## Usage Examples

### Example 1: Session Preparation

**You say to Claude:**
```
I need help preparing my next session. Use ChatGPT to create a plan where the party investigates Thundertree ruins at level 3. Use conversation ID "session-next".
```

**Claude will:**
1. Call `chatgpt_prepare_session` with your description
2. Include your campaign context automatically
3. Return ChatGPT's detailed session plan

### Example 2: NPC Creation

**You say to Claude:**
```
I need a quirky shopkeeper for Phandalin. Ask ChatGPT to create one.
```

**Claude will:**
1. Call `chatgpt_generate_npc`
2. Return a detailed NPC with personality, secrets, and roleplaying tips

### Example 3: Multi-Turn Planning

**You say to Claude:**
```
Use ChatGPT to help me plan session 6. Start with conversation ID "session-6".
```

Then continue:
```
Now ask ChatGPT to add more detail on the first encounter (same conversation).
```

```
Ask ChatGPT what treasure would be appropriate (same conversation).
```

The conversation history is maintained across all calls.

## Configuration Options

Edit `.env` to customize:

```env
# Required: OpenAI API Key
CHATGPT_API_KEY=sk-proj-your-key-here

# Optional: Model selection (default: gpt-4-turbo-preview)
CHATGPT_MODEL=gpt-4-turbo-preview
# or
CHATGPT_MODEL=gpt-3.5-turbo

# Optional: Campaign content directory (default: ../notion-import)
CONTENT_DIR=../notion-import
```

### Model Selection

- **gpt-4-turbo-preview**: Best quality, most expensive (~$0.01-0.03/request)
- **gpt-4**: Reliable, high quality
- **gpt-3.5-turbo**: Faster, cheaper (~$0.001-0.003/request)

## Comparison: MCP Server vs CLI Assistant

You now have TWO ways to use ChatGPT:

### Option 1: MCP Server (Claude → ChatGPT)

**Location:** `chatgpt-mcp-server/`

**Usage:** Ask Claude to use ChatGPT
```
"Use ChatGPT to prepare my session"
"Ask ChatGPT to create an NPC"
```

**Pros:**
- Integrated into your Claude workflow
- Claude can combine its knowledge with ChatGPT's
- Seamless context switching

**When to use:**
- You're already working with Claude
- You want Claude to delegate specific tasks to ChatGPT
- You want the best of both AI assistants

### Option 2: CLI Assistant (Direct ChatGPT)

**Location:** `chatgpt-assistant/`

**Usage:** Run commands directly
```bash
npm start
npm run prep "session description"
```

**Pros:**
- Direct access to ChatGPT
- Interactive chat mode
- Standalone tool

**When to use:**
- Quick ChatGPT queries outside of Claude
- Interactive session planning
- You prefer command-line tools

## Troubleshooting

### "Server not found" in Claude

1. Check `.mcp.json` has the correct path
2. Restart VS Code completely
3. Check the path matches your username

### "Invalid API Key"

1. Verify your `.env` file has the correct API key
2. Get a new key from: https://platform.openai.com/api-keys
3. Make sure the key starts with `sk-proj-`

### "No campaign content"

1. Sync from Notion:
   ```bash
   cd ../notion-sync
   npm run sync
   ```

2. Check `CONTENT_DIR` in `.env` points to the right directory

### "Rate limit exceeded"

You're making too many requests. Wait a minute or switch to `gpt-3.5-turbo` in `.env`.

## Development

### Testing the Server Manually

```bash
# Test that the server starts
./mcp-chatgpt-wrapper.sh

# Should output: "ChatGPT MCP Server running on stdio"
```

### Viewing Logs

The server logs to stderr. Claude Code may show these in the output panel.

### File Structure

```
chatgpt-mcp-server/
├── src/
│   └── index.js                  # MCP server implementation
├── mcp-chatgpt-wrapper.sh        # Wrapper script
├── package.json                  # Dependencies
├── .env                          # Configuration (not committed)
├── .env.example                  # Configuration template
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

## Security

**Important:** Never commit `.env` file!

The `.env` file contains your API key and should remain private:
- ✅ `.env.example` is committed (template)
- ❌ `.env` is gitignored (your actual key)

## Resources

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [OpenAI API](https://platform.openai.com/docs)
- [Claude Code](https://docs.anthropic.com/claude/docs/claude-code)

## Support

For issues:
1. Check this README
2. Verify API key in `.env`
3. Restart VS Code
4. Check [../.mcp.json](../.mcp.json) configuration

---

**Version:** 1.0.0
**Last Updated:** 2026-01-28
**Part of:** PhandelverAndBelow Campaign Management System
