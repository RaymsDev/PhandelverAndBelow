# Guide de configuration Google Drive + Claude Code (VS Code Extension)

Ce guide explique comment configurer l'accès Google Drive pour Claude Code sur Linux.

---

## Étape 1 : Créer un projet Google Cloud et activer l'API

1. Allez sur <https://console.cloud.google.com/>
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Dans le menu, allez dans **"APIs & Services"** > **"Enabled APIs & services"**
4. Cliquez sur **"+ ENABLE APIS AND SERVICES"**
5. Recherchez **"Google Drive API"**
6. Cliquez sur **"Google Drive API"** puis **"Enable"**

---

## Étape 2 : Créer des credentials OAuth 2.0

### Option A : Credentials OAuth 2.0 (recommandé pour accès complet)

1. Dans **"APIs & Services"** > **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Si demandé, configurez d'abord l'écran de consentement OAuth :
   - Type : **External** (ou Internal si vous êtes dans Google Workspace)
   - Remplissez les informations requises (nom de l'app, email de support)
   - Scopes : Ajoutez les scopes Google Drive nécessaires :
     - `https://www.googleapis.com/auth/drive.readonly` (lecture seule)
     - `https://www.googleapis.com/auth/drive.file` (fichiers créés par l'app)
     - `https://www.googleapis.com/auth/drive` (accès complet, si nécessaire)
   - Test users : Ajoutez votre email si en mode External
4. Retournez dans **"Credentials"** et créez l'OAuth client ID :
   - Application type : **Desktop app** ou **Web application**
   - Name : `Claude Code Google Drive`
5. **Téléchargez le fichier JSON** des credentials
6. **GARDEZ CE FICHIER SECRET** !

### Option B : Service Account (pour automatisation)

1. Dans **"APIs & Services"** > **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** > **"Service account"**
3. Remplissez les informations et créez
4. Dans la liste des service accounts, cliquez sur le compte créé
5. Allez dans l'onglet **"Keys"**
6. Cliquez sur **"Add Key"** > **"Create new key"**
7. Choisissez **JSON** et téléchargez
8. **Partagez vos dossiers/fichiers Google Drive** avec l'email du service account

---

## Étape 3 : Configurer Claude Code (MCP) sur Linux

### ⚠️ IMPORTANT : Deux méthodes selon votre usage

| Usage                             | Fichier de config                             |
| --------------------------------- | --------------------------------------------- |
| **Claude Desktop App**            | `~/.config/claude/claude_desktop_config.json` |
| **Claude Code VS Code Extension** | `~/.claude.json` (section `projects`)         |

---

### Pour Claude Code VS Code Extension (recommandé)

Il existe plusieurs serveurs MCP pour Google Drive. Voici les principales options :

#### Option 1 : Serveur MCP officiel Google Drive

1. **Créez ou ouvrez le fichier de configuration** :

   ```bash
   code ~/.claude.json
   ```

2. **Ajoutez la configuration MCP dans `mcpServers`** :

   Pour le projet actuel `/home/user/PhandelverAndBelow` :

   ```json
   {
     "projects": {
       "/home/user/PhandelverAndBelow": {
         "mcpServers": {
           "google-drive": {
             "command": "npx",
             "args": ["-y", "@modelcontextprotocol/server-gdrive"],
             "env": {
               "GOOGLE_DRIVE_CREDENTIALS_FILE": "/chemin/vers/votre/credentials.json",
               "GOOGLE_DRIVE_TOKEN_FILE": "/home/user/.config/google-drive-mcp-token.json"
             }
           }
         }
       }
     }
   }
   ```

   **OU** si vous avez aussi Notion configuré :

   ```json
   {
     "projects": {
       "/home/user/PhandelverAndBelow": {
         "mcpServers": {
           "notion": {
             "command": "npx",
             "args": ["-y", "@notionhq/notion-mcp-server"],
             "env": {
               "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer votre_token_notion\", \"Notion-Version\": \"2022-06-28\"}"
             }
           },
           "google-drive": {
             "command": "npx",
             "args": ["-y", "@modelcontextprotocol/server-gdrive"],
             "env": {
               "GOOGLE_DRIVE_CREDENTIALS_FILE": "/chemin/vers/votre/credentials.json",
               "GOOGLE_DRIVE_TOKEN_FILE": "/home/user/.config/google-drive-mcp-token.json"
             }
           }
         }
       }
     }
   }
   ```

3. **Remplacez `/chemin/vers/votre/credentials.json`** par le chemin vers votre fichier OAuth credentials téléchargé

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
       "google-drive": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-gdrive"],
         "env": {
           "GOOGLE_DRIVE_CREDENTIALS_FILE": "/chemin/vers/votre/credentials.json",
           "GOOGLE_DRIVE_TOKEN_FILE": "/home/user/.config/google-drive-mcp-token.json"
         }
       }
     }
   }
   ```

---

## Étape 4 : Premier lancement et authentification OAuth

1. **Fermez complètement VS Code**
2. **Relancez VS Code** et ouvrez votre projet
3. Au premier lancement, le serveur MCP Google Drive va :
   - Détecter qu'il n'y a pas encore de token OAuth
   - Ouvrir votre navigateur pour vous connecter à Google
   - Demander l'autorisation d'accéder à Google Drive
   - Sauvegarder le token dans `GOOGLE_DRIVE_TOKEN_FILE`
4. **Autorisez l'accès** dans le navigateur
5. Retournez dans VS Code - la connexion devrait être active !

---

## Étape 5 : Organiser vos fichiers de campagne

Je recommande de créer une structure dans Google Drive pour votre campagne :

```
📁 Phandelver Campaign/
├── 📁 Characters/
│   ├── 📄 Joueurs.docx
│   ├── 📄 NPCs.docx
│   └── 📄 Antagonistes.docx
├── 📁 Locations/
│   ├── 📄 Phandalin.docx
│   ├── 📄 Wave Echo Cave.docx
│   └── 📄 Thundertree.docx
├── 📁 Sessions/
│   ├── 📄 Session 01 - Notes.docx
│   ├── 📄 Session 02 - Notes.docx
│   └── 📁 Handouts/
├── 📁 Maps/
│   ├── 🖼️ Phandalin-map.png
│   └── 🖼️ Redbrand-hideout.jpg
└── 📁 Resources/
    ├── 📄 Rules Reference.pdf
    └── 📄 Homebrew Items.docx
```

Vous pouvez ensuite demander à Claude :
- "Liste les fichiers dans mon dossier Phandelver Campaign"
- "Lis le document Session 01 - Notes"
- "Crée un nouveau document de session dans Sessions/"

---

## Vérification

Une fois redémarré, demandez à Claude :

- "Liste mes fichiers Google Drive"
- "Cherche dans mon Google Drive les fichiers sur Phandalin"
- "Lis le fichier [nom] dans mon Google Drive"
- "Crée un nouveau document Google Drive pour [sujet]"

---

## Troubleshooting

### Erreur "package not found" ou serveur MCP introuvable

Si `@modelcontextprotocol/server-gdrive` ne fonctionne pas, essayez une alternative :

```bash
# Vérifier les packages MCP Google Drive disponibles
npm search mcp google drive
```

Alternatives possibles :
- `@google-drive/mcp-server`
- `mcp-server-google-drive`

### Erreur d'authentification OAuth

1. Vérifiez que le fichier `credentials.json` existe et est au bon chemin
2. Supprimez le fichier token (`~/.config/google-drive-mcp-token.json`) et réessayez
3. Vérifiez que vous avez ajouté votre email dans "Test users" si l'app est en mode External
4. Vérifiez que l'API Google Drive est bien activée dans Google Cloud Console

### Node.js non installé

Vérifiez que Node.js est installé :

```bash
node --version  # Devrait afficher v24.x (selon .nvmrc)
npm --version
```

Pour installer la bonne version avec nvm :

```bash
nvm install 24
nvm use 24
```

### Les outils MCP n'apparaissent pas

1. Vérifiez que le fichier `~/.claude.json` est bien formaté (JSON valide)
2. Assurez-vous que le chemin du projet est correct
3. Redémarrez **complètement** VS Code (fermer le processus)
4. Vérifiez les logs du serveur MCP dans la console de débogage VS Code

### Accès refusé aux fichiers

Si vous utilisez un **Service Account** :
- Partagez explicitement chaque dossier/fichier avec l'email du service account
- L'email est du type : `nom-service@projet-id.iam.gserviceaccount.com`

---

## Sécurité

⚠️ **Important** :

- Ne commitez **JAMAIS** les fichiers suivants dans Git :
  - `credentials.json` (OAuth ou Service Account credentials)
  - Token files (`*-token.json`)
  - `.claude.json` (contient les chemins vers les credentials)
- Ajoutez ces patterns à votre `.gitignore` :
  ```
  credentials.json
  *-token.json
  .claude.json
  google-drive-integration/credentials/
  ```
- Si des credentials sont compromis, révoquez-les immédiatement dans Google Cloud Console

---

## Structure recommandée du projet

```
PhandelverAndBelow/
├── .gitignore (ajouter credentials et tokens)
├── notion-import/ (données Notion)
├── google-drive-integration/
│   ├── docs/
│   │   └── GUIDE-CONFIGURATION-GOOGLE-DRIVE.md (ce fichier)
│   └── credentials/ (à ajouter au .gitignore)
│       ├── credentials.json (OAuth ou Service Account)
│       └── .gitkeep
└── sessions/
```

---

## Synchro Notion ↔ Google Drive

Une fois les deux intégrations configurées, vous pouvez :

1. **Importer depuis Notion vers Google Drive** :
   - "Lis mes personnages depuis Notion et crée un Google Doc récapitulatif"

2. **Synchroniser les données** :
   - "Compare les informations de Phandalin entre Notion et Google Drive"

3. **Sauvegardes automatiques** :
   - "Exporte toutes mes fiches de personnages Notion vers Google Drive au format Markdown"

---

## Références

- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [OAuth 2.0 pour applications installées](https://developers.google.com/identity/protocols/oauth2/native-app)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers GitHub](https://github.com/modelcontextprotocol/servers)

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez d'abord la section Troubleshooting ci-dessus
2. Consultez les logs de VS Code (View > Output > sélectionnez "Claude Code")
3. Vérifiez que toutes les étapes ont été suivies dans l'ordre
4. Assurez-vous que les permissions sont correctes sur les fichiers credentials

---

**Note** : Ce guide suppose l'utilisation du serveur MCP `@modelcontextprotocol/server-gdrive`. Si ce package n'existe pas encore ou n'est pas stable, vous devrez peut-être utiliser un serveur alternatif ou contribuer à créer un serveur MCP pour Google Drive.
