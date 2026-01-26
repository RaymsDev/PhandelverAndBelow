# ChatGPT D&D Assistant - Examples

This file contains example commands and prompts to help you get the most out of the ChatGPT D&D assistant.

## Session Preparation Examples

### Basic Session Prep
```bash
npm run prep "The party is heading to Cragmaw Castle to rescue Gundren"
```

### Detailed Session Prep
```bash
npm run prep "Session 5: The party needs to investigate the Redbrand hideout, likely encountering Glasstaff and learning about the Black Spider"
```

### Quick Session Ideas
```bash
npm run prep "Need a side quest in Phandalin, something involving the townsfolk"
```

## NPC Generation Examples

### Quick NPC
```bash
npm run npc "a mysterious hooded figure at the Stonehill Inn"
```

### Detailed NPC
```bash
npm run npc "a grumpy dwarf blacksmith in Phandalin who knows about Wave Echo Cave but won't share easily"
```

### Faction NPC
```bash
npm run npc "a member of the Lords' Alliance investigating the Redbrands"
```

### Villain NPC
```bash
npm run npc "a lieutenant of the Black Spider, a drow spellcaster"
```

## Encounter Generation Examples

### Combat Encounter
```bash
npm run encounter "goblin ambush on the Triboar Trail" --level 2
```

### Dungeon Encounter
```bash
npm run encounter "exploring a collapsed section of Wave Echo Cave with undead" --level 4
```

### Social Encounter
```bash
npm run encounter "negotiating with the Redbrands in their hideout" --level 3
```

### Environmental Encounter
```bash
npm run encounter "crossing a rickety bridge over a chasm in Cragmaw Castle" --level 3
```

## Lore Questions Examples

### Location Lore
```bash
npm run lore "What is the history of Wave Echo Cave and the Phandelver Pact?"
```

### Faction Lore
```bash
npm run lore "Tell me about the Lords' Alliance and their interest in Phandalin"
```

### Monster Lore
```bash
npm run lore "What are drow doing in this region and why?"
```

### Magic Item Lore
```bash
npm run lore "What is the significance of the Forge of Spells?"
```

## Interactive Chat Examples

Start interactive mode:
```bash
npm start
# or
npm run chat
```

### Session Planning Conversation
```
You: I need to plan the next session. The party just defeated the Redbrands.

ChatGPT: [provides session structure]

You: They're level 3 now. What level-appropriate encounters could they face?

ChatGPT: [suggests encounters]

You: I like the idea of the undead in Thundertree. Can you develop that?

ChatGPT: [detailed encounter]
```

### NPC Development
```
You: Generate a quirky shop owner for Phandalin

ChatGPT: [creates NPC]

You: Great! Now give me some unique items they might sell

ChatGPT: [suggests items]

You: What secrets could this NPC know about the Black Spider?

ChatGPT: [develops plot hooks]
```

### World Building
```
You: I want to add more depth to Phandalin's history

ChatGPT: [provides historical context]

You: How does this connect to the current threat?

ChatGPT: [makes connections]

You: Create a local legend the townsfolk might know

ChatGPT: [generates legend]
```

## Advanced Prompts

### Multi-Session Arc
```bash
npm run prep "Create a 3-session arc where the party investigates strange disappearances in Phandalin, leading to discovering a hidden cult working for the Black Spider"
```

### Branching Scenarios
```
You: The party might either negotiate with Glasstaff or fight him. Help me prepare for both outcomes.
```

### Improvisation Help
```
You: A player asked about the local temple's history. I didn't prepare this. What could be interesting?
```

### PC Integration
```
You: One of my PCs is a Goliath named Bôbuna. How can I tie her backstory to the Wave Echo Cave plot?
```

### Pacing and Flow
```
You: My last session felt slow. Help me create a more dynamic next session with better pacing.
```

## Tips for Better Prompts

1. **Be Specific**: Include party level, location, and context
   - ❌ "Make an encounter"
   - ✅ "Create a level 3 encounter in the Redbrand hideout involving traps and guards"

2. **Reference Campaign Content**: Mention characters, locations, or plot points
   - ❌ "Random NPC"
   - ✅ "An NPC who knows Sildar Hallwinter and can provide info about the Black Spider"

3. **Define Your Needs**: Specify what you want (combat, roleplay, puzzle, etc.)
   - ❌ "Help with next session"
   - ✅ "Next session needs a social encounter in Phandalin and a combat encounter on the road"

4. **Ask Follow-ups**: Use chat mode for iterative refinement
   - Initial: "Create a dungeon encounter"
   - Follow-up: "Make it more challenging"
   - Follow-up: "Add an environmental hazard"

5. **Request Format**: Specify how you want the output
   - "Give me a stat block for this NPC"
   - "Provide this as a bulleted list"
   - "Format as a DM note card I can use at the table"

## Common Use Cases

### Pre-Session Preparation
```bash
# Get session overview
npm run prep "Session 6: Cragmaw Castle rescue mission"

# Generate needed NPCs
npm run npc "King Grol, bugbear leader of Cragmaw Castle"

# Create encounters
npm run encounter "throne room battle with King Grol and his guards" --level 4

# Check lore
npm run lore "What would Gundren know about Wave Echo Cave?"
```

### During Session (Quick Lookups)
```bash
# Generate improvised NPC
npm run npc "random traveler on the road with information"

# Quick encounter
npm run encounter "wolves attacking at night" --level 3

# Lore check
npm run lore "What do locals say about Thundertree?"
```

### Post-Session Planning
```bash
# Start chat for next session brainstorming
npm start

You: Last session the party found a mysterious map. What could it lead to?
You: They also made an enemy of the Zhentarim. How should I develop this?
You: One player wants to craft a magic item. What's appropriate for level 4?
```

## Content Listing

View your campaign content:
```bash
# List everything
npm run list

# List only characters
npm run list --characters

# List only locations
npm run list --locations

# List only adventures
npm run list --adventures

# List only factions
npm run list --factions
```

## Troubleshooting

### API Key Issues
```bash
# Initialize .env file
npm run init

# Then edit .env and add your key
# Get key from: https://platform.openai.com/api-keys
```

### No Campaign Content
Make sure your `notion-import` directory has content:
```bash
cd ../notion-sync
npm run sync
```

### Model Selection
Edit `.env` to change the ChatGPT model:
```
CHATGPT_MODEL=gpt-4-turbo-preview  # More capable, more expensive
CHATGPT_MODEL=gpt-3.5-turbo        # Faster, cheaper
```
