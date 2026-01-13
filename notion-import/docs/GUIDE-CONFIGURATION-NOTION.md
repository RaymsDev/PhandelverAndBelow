# Guide de configuration Notion + Claude Code (VS Code Extension)

Ce guide explique comment configurer l'accès Notion pour Claude Code sur Linux.

---

## Étape 1 : Créer l'intégration Notion

1. Allez sur <https://www.notion.so/my-integrations>
2. Cliquez sur **"New integration"** (ou "+ Create new integration")
3. Remplissez :
   - **Name** : `Claude Code` (ou un nom de votre choix)
   - **Associated workspace** : Sélectionnez votre workspace
   - **Type** : Internal
4. Sous **Capabilities**, assurez-vous que ces permissions sont activées :
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
5. Cliquez sur **Submit**
6. **COPIEZ LE TOKEN** qui apparaît (commence par `ntn_...` ou `secret_...`)
   - ⚠️ Gardez-le secret, ne le partagez jamais publiquement !

---

## Étape 2 : Partager vos pages Notion avec l'intégration

Pour **chaque page** que vous voulez que Claude puisse lire/modifier :

1. Ouvrez la page dans Notion
2. Cliquez sur les **trois points** (...) en haut à droite
3. Faites défiler jusqu'à **"Connections"** ou **"Add connections"**
4. Cherchez et sélectionnez votre intégration **"Claude Code"**
5. Confirmez

💡 **Astuce** : Si vous partagez une page parente, toutes les sous-pages seront aussi accessibles.

---

## Étape 3 : Configurer Claude Code (MCP) sur Linux

### ⚠️ IMPORTANT : Deux méthodes selon votre usage

| Usage                             | Fichier de config                             |
| --------------------------------- | --------------------------------------------- |
| **Claude Desktop App**            | `~/.config/claude/claude_desktop_config.json` |
| **Claude Code VS Code Extension** | `~/.claude.json` (section `projects`)         |

---

### Pour Claude Code VS Code Extension (recommandé)

1. **Ouvrez le fichier de configuration** :

   ```bash
   code ~/.claude.json
   ```

2. **Trouvez la section `projects`** puis le chemin de votre projet.

3. **Ajoutez la configuration MCP dans `mcpServers`** :

   ```json
   {
     "projects": {
       "/chemin/vers/votre/projet": {
         "mcpServers": {
           "notion": {
             "command": "npx",
             "args": ["-y", "@notionhq/notion-mcp-server"],
             "env": {
               "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer VOTRE_TOKEN_ICI\", \"Notion-Version\": \"2022-06-28\"}"
             }
           }
         }
       }
     }
   }
   ```

   **Exemple complet** (remplacez `VOTRE_TOKEN_ICI` par votre token) :

   ```json
   "mcpServers": {
     "notion": {
       "command": "npx",
       "args": ["-y", "@notionhq/notion-mcp-server"],
       "env": {
         "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_xxxxxxxxxxxxx\", \"Notion-Version\": \"2022-06-28\"}"
       }
     }
   },
   ```

4. **Sauvegardez le fichier** (`Ctrl+S`)

---

### Pour Claude Desktop App (alternative)

1. **Créez le répertoire si nécessaire** :

   ```bash
   mkdir -p ~/.config/claude
   ```

2. **Créez ou éditez le fichier** :

   ```bash
   code ~/.config/claude/claude_desktop_config.json
   ```

3. **Ajoutez cette configuration** :

   ```json
   {
     "mcpServers": {
       "notion": {
         "command": "npx",
         "args": ["-y", "@notionhq/notion-mcp-server"],
         "env": {
           "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer VOTRE_TOKEN_ICI\", \"Notion-Version\": \"2022-06-28\"}"
         }
       }
     }
   }
   ```

---

## Étape 4 : Redémarrer Claude Code

1. **Fermez complètement VS Code** (pas juste la fenêtre, mais le processus)
2. **Relancez VS Code** et ouvrez votre projet
3. La connexion Notion devrait être active !

---

## Vérification

Une fois redémarré, demandez à Claude :

- "Cherche mes pages Notion"
- "Lis ma page Notion sur [sujet]"
- "Crée une nouvelle page dans mon Notion pour [sujet]"

---

## Troubleshooting

### Erreur "package not found" ou "E404"

❌ **MAUVAIS** package (n'existe pas) :

```
@modelcontextprotocol/server-notion
```

✅ **BON** package (officiel Notion) :

```
@notionhq/notion-mcp-server
```

### Erreur de variable d'environnement

❌ **MAUVAIS** format :

```json
"env": {
  "NOTION_API_KEY": "votre_token"
}
```

✅ **BON** format (pour le serveur officiel) :

```json
"env": {
  "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer votre_token\", \"Notion-Version\": \"2022-06-28\"}"
}
```

### Node.js non installé

Vérifiez que Node.js et npm sont installés :

```bash
node --version
npm --version
```

Si non installés :

```bash
sudo apt update
sudo apt install nodejs npm
```

Ou utilisez nvm pour une version récente :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

### Les outils MCP n'apparaissent pas

1. Vérifiez que le fichier `~/.claude.json` est bien formaté (JSON valide)
2. Assurez-vous que la config est dans la bonne section `projects` pour votre chemin de projet
3. Redémarrez **complètement** VS Code (pas juste reload window)

### Claude ne voit toujours pas mes pages

- Vérifiez que vous avez bien partagé les pages avec l'intégration dans Notion
- Attendez 1-2 minutes après le partage
- Redémarrez Claude Code

---

## Alternative : Utilisation sans MCP

Si la configuration MCP ne fonctionne pas, vous pouvez toujours :

1. **Partager vos pages en "Share to web"** dans Notion
2. **Donner les liens publics** à Claude
3. Claude utilisera WebFetch pour les lire (lecture seule)

---

## Sécurité

⚠️ **Important** :

- Ne commitez JAMAIS le fichier `~/.claude.json` avec votre token dans Git
- Ajoutez `.claude.json` à votre `.gitignore` global si nécessaire
- Ne partagez jamais votre token publiquement
- Si compromis, révoquez-le immédiatement sur <https://www.notion.so/my-integrations>

---

## Références

- [Serveur MCP Notion officiel (GitHub)](https://github.com/makenotion/notion-mcp-server)
- [Documentation Notion MCP](https://developers.notion.com/docs/mcp)
- [Package npm officiel](https://www.npmjs.com/package/@notionhq/notion-mcp-server)
