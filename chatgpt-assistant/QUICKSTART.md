# Quick Start Guide

Get started with the ChatGPT D&D Assistant in 3 minutes.

## Installation (One Time)

```bash
cd chatgpt-assistant
npm install
```

## Setup API Key (One Time)

Your API key is already configured in `.env` from the parent project!

Verify it:
```bash
cat .env | grep CHATGPT_API_KEY
```

## Usage

### Interactive Mode (Best for Session Planning)

```bash
cd chatgpt-assistant
npm start
```

Then chat naturally:
```
You: Plan my next session. The party just finished the Redbrand hideout.
You: Generate a mysterious NPC for the Stonehill Inn
You: What's the lore behind Wave Echo Cave?
```

Type `exit` to quit, `clear` to reset conversation.

### Quick Commands

```bash
# Prepare a session
npm run prep "Investigating Thundertree ruins"

# Generate an NPC
npm run npc "grumpy dwarf merchant who hates elves"

# Create an encounter
npm run encounter "goblin ambush on the road" --level 3

# Get lore
npm run lore "Who is the Black Spider?"

# List campaign content
node src/index.js list
```

## Your First Session Prep

Try this now:

```bash
npm start
```

Then type:
```
Plan my next session. The party is heading to Cragmaw Castle to rescue Gundren. They are level 3.
```

ChatGPT will give you:
- Session structure
- Encounter suggestions
- NPC interactions
- Plot hooks
- Pacing advice

All using your actual campaign data (19 characters, 8 locations, 13 adventures)!

## Tips

1. **Start with `npm start`** for interactive mode
2. **Be specific** in your requests (include level, location, goals)
3. **Ask follow-ups** to refine ideas
4. **Use `clear`** when changing topics
5. **Reference your NPCs/locations** by name

## What It Knows

The assistant has access to all your campaign content:
- 19 characters (PCs, NPCs, villains)
- 8 locations (Phandalin, Wave Echo Cave, etc.)
- 13 adventures
- 1 faction (Circle of Light)

It uses this context automatically in every response!

## Common Commands

```bash
# Session planning
npm start

# Quick NPC
npm run npc "your description here"

# Quick encounter
npm run encounter "your description" --level 3

# Check what's available
node src/index.js list --characters
node src/index.js list --locations
```

## Troubleshooting

**"CHATGPT_API_KEY not found"**
→ Check `.env` file has your API key

**"No content found"**
→ Run `cd ../notion-sync && npm run sync` first

**"Rate limit"**
→ Wait 1 minute and try again

## Next Steps

See [README.md](README.md) for full documentation
See [EXAMPLES.md](EXAMPLES.md) for detailed examples

---

**Happy DM'ing!** 🎲
