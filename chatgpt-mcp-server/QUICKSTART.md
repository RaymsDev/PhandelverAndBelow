# ChatGPT MCP Server - Quick Start

Get ChatGPT integrated with Claude Code in 2 minutes.

## What You Get

Ask Claude to use ChatGPT for D&D tasks:
- "Use ChatGPT to prepare my next session"
- "Ask ChatGPT to create an NPC"
- "Have ChatGPT design an encounter"

## Setup (Already Done!)

✅ MCP server installed
✅ Dependencies installed
✅ API key configured
✅ Registered in `.mcp.json`

## Activation

**Just restart VS Code:**

1. Close VS Code completely (⌘Q or Ctrl+Q)
2. Reopen the PhandelverAndBelow project
3. Done! The ChatGPT MCP server is now active

## First Use

After restarting VS Code, try this with Claude:

```
Use ChatGPT to help me prepare a session where the party
investigates the Redbrand hideout. They are level 3.
```

Claude will:
1. Call the ChatGPT MCP server
2. Include your campaign context automatically
3. Return a detailed session plan from ChatGPT

## Available Commands

Tell Claude to use ChatGPT for:

### Session Prep
```
"Use ChatGPT to prepare my next session [description]"
```

### NPC Creation
```
"Ask ChatGPT to create a [description] NPC"
```

### Encounter Design
```
"Have ChatGPT create a level X encounter with [description]"
```

### Lore Questions
```
"Ask ChatGPT about [lore topic]"
```

### General Chat
```
"Use ChatGPT to brainstorm ideas for [topic]"
```

## Maintaining Context

Use conversation IDs to maintain context across multiple calls:

```
You: Use ChatGPT to plan session 5, conversation ID "session-5"
Claude: [gets session plan from ChatGPT]

You: Now ask ChatGPT to add NPCs, same conversation
Claude: [ChatGPT remembers the session context]

You: Ask ChatGPT for encounters, same conversation
Claude: [ChatGPT remembers everything from this conversation]
```

## Campaign Context

ChatGPT automatically knows about:
- ✅ 19 characters (Bôbuna, Sildar, Glasstaff, etc.)
- ✅ 8 locations (Phandalin, Wave Echo Cave, etc.)
- ✅ 13 adventures
- ✅ Your campaign setting

This ensures consistent, relevant responses.

## Checking It Works

After restarting VS Code, ask Claude:

```
Can you see the ChatGPT MCP server?
```

Claude should confirm it has access to ChatGPT tools.

## Two Ways to Use ChatGPT

### 1. Through Claude (MCP Server)
**Location:** `chatgpt-mcp-server/`
**Usage:** Ask Claude to use ChatGPT
**Best for:** Integrated workflow with Claude

### 2. Direct CLI (Standalone)
**Location:** `chatgpt-assistant/`
**Usage:** `npm start` for interactive chat
**Best for:** Quick standalone ChatGPT queries

Both work! Use whichever fits your workflow.

## Troubleshooting

**"Can't find ChatGPT server"**
→ Restart VS Code completely

**"Invalid API key"**
→ Check `.env` has your API key

**"No response from ChatGPT"**
→ Check your internet connection and API quota

## Next Steps

- See [README.md](README.md) for full documentation
- Try asking Claude to use ChatGPT for your next session
- Experiment with conversation IDs for multi-turn planning

## Example Session

```
You: Use ChatGPT to help me plan session 6 where the party
     explores Cragmaw Castle to rescue Gundren. Party is level 4.
     Use conversation ID "session-6".

Claude: I'll use ChatGPT to prepare this session.
        [Calls chatgpt_prepare_session...]

        Here's the session plan from ChatGPT:
        [Detailed session plan with encounters, NPCs, plot hooks]

You: Great! Now ask ChatGPT to expand on the throne room
     encounter. Same conversation.

Claude: [Calls ChatGPT with conversation history...]

        Here are more details on the throne room:
        [Detailed encounter with King Grol]

You: Perfect! Ask ChatGPT what treasure they should find.
     Same conversation.

Claude: [Calls ChatGPT, maintaining full context...]

        Recommended treasure:
        [Treasure appropriate for level 4 party]
```

---

**Ready to use!** Just restart VS Code and start asking Claude to use ChatGPT.

**Questions?** See [README.md](README.md) for detailed documentation.
