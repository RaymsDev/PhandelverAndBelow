# Guide de configuration Google Drive + Claude Code (VS Code Extension)

Ce guide explique comment configurer l'accès Google Drive pour Claude Code sur Linux avec un Service Account.

---

## ⚠️ AVERTISSEMENT : Problèmes de compatibilité actuels (Janvier 2026)

**STATUS** : Configuration partiellement fonctionnelle avec des limitations.

Les packages MCP pour Google Drive ont actuellement des problèmes de compatibilité :

- **`mcp-google-drive`** : Ne supporte pas correctement le JSON inline dans `GOOGLE_SERVICE_ACCOUNT_KEY`, essaie de lire la valeur comme un chemin de fichier au lieu du contenu JSON.
- **`@mcp-z/mcp-drive`** : Requiert `GOOGLE_CLIENT_ID` même en mode `service-account`, ce qui empêche l'utilisation pure du Service Account.
- **`@modelcontextprotocol/server-gdrive`** : Marqué comme DEPRECATED et n'est plus supporté.

### Alternative recommandée : Notion

Pour obtenir le contexte de votre campagne, **utilisez Notion** qui fonctionne parfaitement avec Claude Code :
- Configuration simple et fiable
- API stable et bien documentée
- Intégration MCP complète et fonctionnelle

Voir le [Guide de configuration Notion](../../docs/GUIDE-CONFIGURATION-NOTION.md) pour plus d'informations.

### Si vous souhaitez quand même essayer Google Drive

Vous pouvez suivre ce guide, mais attendez-vous à rencontrer des problèmes. La configuration décrite ci-dessous a été testée mais les outils MCP peuvent ne pas fonctionner correctement au runtime.

---

## Prérequis

- Node.js 18+ installé
- VS Code avec l'extension Claude Code
- Un compte Google

---

## Étape 1 : Créer un projet Google Cloud et activer l'API

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet (ou sélectionnez un projet existant)
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur **"NEW PROJECT"**
   - Donnez un nom à votre projet (ex: "DonjonsAndDragons")
   - Cliquez sur **"CREATE"**
3. Sélectionnez votre projet
4. Dans le menu de gauche, allez dans **"APIs & Services"** > **"Enabled APIs & services"**
5. Cliquez sur **"+ ENABLE APIS AND SERVICES"**
6. Recherchez **"Google Drive API"**
7. Cliquez sur **"Google Drive API"** puis **"ENABLE"**

---

## Étape 2 : Créer un Service Account

### Pourquoi un Service Account ?

Un Service Account est plus simple qu'OAuth car il ne nécessite pas d'ouvrir un navigateur à chaque authentification. Il suffit de partager vos fichiers Google Drive avec l'email du Service Account.

### Créer le Service Account

1. Dans **"APIs & Services"** > **"IAM & Admin"** > **"Service Accounts"**
2. Cliquez sur **"+ CREATE SERVICE ACCOUNT"**
3. Remplissez :
   - **Service account name** : `claude-code-drive` (ou un nom de votre choix)
   - **Service account ID** : (sera rempli automatiquement)
   - **Description** : `Service account for Claude Code to access Google Drive`
4. Cliquez sur **"CREATE AND CONTINUE"**
5. Sautez l'étape "Grant this service account access to project" (cliquez sur **"CONTINUE"**)
6. Sautez l'étape "Grant users access" (cliquez sur **"DONE"**)

### Créer une clé JSON

1. Dans la liste des Service Accounts, trouvez celui que vous venez de créer
2. Cliquez sur l'**email du service account** (toute la ligne)
3. Allez dans l'onglet **"KEYS"** (en haut)
4. Cliquez sur **"ADD KEY"** > **"Create new key"**
5. Sélectionnez **"JSON"**
6. Cliquez sur **"CREATE"**
7. Un fichier JSON sera téléchargé automatiquement (ex: `donjonsanddragons-xxxxx.json`)

**⚠️ GARDEZ CE FICHIER SECRET !** Ne le partagez jamais publiquement.

---

## Étape 3 : Placer le fichier Service Account dans le projet

### Sur WSL (Windows Subsystem for Linux)

Si vous utilisez WSL et que le fichier est dans vos téléchargements Windows :

```bash
# Copier depuis Windows vers WSL
cp /mnt/c/Users/VOTRE_NOM_UTILISATEUR/Downloads/donjonsanddragons-xxxxx.json \
   /chemin/vers/votre/projet/google-drive-integration/credentials/service-account.json
```

### Sur Linux natif

```bash
# Déplacer le fichier téléchargé
mv ~/Downloads/donjonsanddragons-xxxxx.json \
   /chemin/vers/votre/projet/google-drive-integration/credentials/service-account.json
```

---

## Étape 4 : Configurer Claude Code (MCP)

### ⚠️ IMPORTANT : Emplacement de la configuration

| Usage                             | Fichier de config                             |
| --------------------------------- | --------------------------------------------- |
| **Claude Desktop App**            | `~/.config/claude/claude_desktop_config.json` |
| **Claude Code VS Code Extension** | `~/.claude.json` (section `projects`)         |

---

### Configuration pour VS Code Extension (recommandé)

1. **Ouvrez le fichier de configuration** :

   ```bash
   code ~/.claude.json
   ```

2. **Trouvez ou créez la section `projects`** pour votre projet

3. **Lisez le contenu du fichier service account** (sur une seule ligne) :

   ```bash
   cat /chemin/vers/service-account.json | tr -d '\n'
   ```

4. **Ajoutez la configuration MCP Google Drive dans `mcpServers`** :

   **Exemple avec Google Drive seul** :

   ```json
   {
     "projects": {
       "/home/user/PhandelverAndBelow": {
         "mcpServers": {
           "google-drive": {
             "command": "npx",
             "args": ["-y", "mcp-google-drive"],
             "env": {
               "GOOGLE_SERVICE_ACCOUNT_KEY": "{  \"type\": \"service_account\",  \"project_id\": \"votre-project-id\",  \"private_key_id\": \"...\",  \"private_key\": \"...\",  \"client_email\": \"votre-service-account@votre-project.iam.gserviceaccount.com\", ... }"
             }
           }
         }
       }
     }
   }
   ```

   **Exemple avec Notion + Google Drive** :

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
             "args": ["-y", "mcp-google-drive"],
             "env": {
               "GOOGLE_SERVICE_ACCOUNT_KEY": "{  \"type\": \"service_account\",  \"project_id\": \"votre-project-id\",  \"private_key_id\": \"...\",  \"private_key\": \"...\",  \"client_email\": \"votre-service-account@votre-project.iam.gserviceaccount.com\", ... }"
             }
           }
         }
       }
     }
   }
   ```

   **⚠️ IMPORTANT** :
   - Remplacez `GOOGLE_SERVICE_ACCOUNT_KEY` par le contenu JSON complet (sur une seule ligne)
   - Les `\n` dans la clé privée doivent être échappés en `\\n`
   - Remplacez `/home/user/PhandelverAndBelow` par le chemin absolu vers votre projet

5. **Sauvegardez le fichier** (`Ctrl+S`)

---

## Étape 5 : Redémarrer VS Code

1. **Fermez complètement VS Code** (pas juste la fenêtre, fermez le processus entier)
2. **Relancez VS Code** et ouvrez votre projet
3. La connexion Google Drive devrait être active !

---

## Étape 6 : Partager vos fichiers avec le Service Account

Le Service Account a son propre Google Drive vide. Pour qu'il puisse accéder à **vos** fichiers Google Drive personnels, vous devez les partager avec lui.

### Email du Service Account

L'email est dans le fichier JSON téléchargé, dans le champ `client_email`. Il ressemble à :
```
votre-nom-service@votre-project-id.iam.gserviceaccount.com
```

### Comment partager vos fichiers

1. Allez sur https://drive.google.com/
2. Sélectionnez un dossier ou fichier que vous voulez partager
3. Clic droit > **"Partager"** (ou bouton Partager)
4. Entrez l'email du service account (ex: `claude-code-drive@donjonsanddragons.iam.gserviceaccount.com`)
5. Définissez les permissions :
   - **Lecteur** : Claude peut seulement lire les fichiers
   - **Éditeur** : Claude peut modifier et créer des fichiers
   - **Propriétaire** : Claude a un contrôle complet (déconseillé)
6. Cliquez sur **"Envoyer"**

💡 **Astuce** : Créez un dossier dédié pour votre campagne D&D et partagez-le avec le Service Account. Tous les sous-dossiers et fichiers seront automatiquement accessibles !

---

## Structure recommandée dans Google Drive

Créez une structure organisée dans Google Drive pour votre campagne :

```
📁 Phandelver Campaign/ (partagé avec le Service Account)
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

---

## Vérification

Une fois VS Code redémarré et vos fichiers partagés, demandez à Claude :

- "Liste mes fichiers Google Drive"
- "Cherche dans mon Google Drive les fichiers sur Phandalin"
- "Lis le fichier [nom] dans mon Google Drive"
- "Crée un nouveau document Google Drive pour [sujet]"

---

## Problèmes connus (Janvier 2026)

### Les outils Google Drive n'apparaissent pas

**Symptôme** : Après avoir configuré le serveur MCP Google Drive, aucun outil `mcp__google-drive__*` n'apparaît dans Claude Code.

**Cause** : Les packages MCP actuels ont des bugs de compatibilité :

1. **`mcp-google-drive`** :
   - Erreur : `Error: ENOENT: no such file or directory, open '/home/user/project/{...json...}'`
   - Le package essaie de lire `GOOGLE_SERVICE_ACCOUNT_KEY` comme un chemin de fichier au lieu de parser le JSON
   - **Pas de solution actuelle** - le package ne supporte pas le JSON inline correctement

2. **`@mcp-z/mcp-drive`** :
   - Erreur : `Error: Environment variable GOOGLE_CLIENT_ID is required for Google OAuth`
   - Le package requiert `GOOGLE_CLIENT_ID` même en mode `--auth=service-account`
   - **Solution temporaire** : Impossible d'utiliser en mode service-account pur

### Recommandation : Utiliser Notion à la place

La meilleure solution actuellement est d'utiliser Notion pour stocker le contexte de votre campagne :

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
        }
      }
    }
  }
}
```

Voir le [Guide de configuration Notion](../../docs/GUIDE-CONFIGURATION-NOTION.md).

---

## Troubleshooting

### Erreur "Authentication not ready"

- Vérifiez que le fichier `service-account.json` existe et est au bon chemin
- Vérifiez que le contenu JSON dans `GOOGLE_SERVICE_ACCOUNT_KEY` est correct
- Redémarrez complètement VS Code

### Package `mcp-google-drive` introuvable

Le package existe et est publié sur npm. Si vous avez une erreur, vérifiez :

```bash
npm view mcp-google-drive
```

Si le package n'est pas accessible, essayez une alternative :
- `@mcp-z/mcp-drive` (supporte OAuth et Service Account)

### Les fichiers n'apparaissent pas

Le Service Account n'a accès qu'aux fichiers/dossiers que vous avez **explicitement partagés** avec son email.

**Solutions** :
1. Vérifiez que vous avez bien partagé les fichiers/dossiers avec l'email du Service Account
2. Attendez quelques minutes après le partage
3. Redémarrez VS Code

### Node.js non installé

Vérifiez que Node.js est installé :

```bash
node --version  # Devrait afficher v18+
npm --version
```

Pour installer Node.js :

```bash
# Avec nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24

# Ou avec apt (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm
```

### Les outils MCP n'apparaissent pas

1. Vérifiez que le fichier `~/.claude.json` est bien formaté (JSON valide)
2. Vérifiez que le chemin du projet est correct (absolu, pas relatif)
3. Redémarrez **complètement** VS Code (fermez le processus)
4. Vérifiez les logs : `View` > `Output` > sélectionnez "Claude Code"

---

## Sécurité

⚠️ **TRÈS IMPORTANT** :

- Ne commitez **JAMAIS** les fichiers suivants dans Git :
  - `service-account.json` (credentials du Service Account)
  - `.claude.json` (contient les credentials en clair)

- Ajoutez ces patterns à votre `.gitignore` :

  ```gitignore
  # Google Drive credentials
  google-drive-integration/credentials/*.json
  !google-drive-integration/credentials/.gitkeep

  # Claude configuration (contient des secrets)
  .claude.json
  ```

- Si les credentials sont compromis :
  1. Allez sur https://console.cloud.google.com/
  2. **"IAM & Admin"** > **"Service Accounts"**
  3. Sélectionnez le Service Account
  4. Allez dans **"Keys"** et supprimez la clé compromise
  5. Créez une nouvelle clé

---

## Structure du projet recommandée

```
PhandelverAndBelow/
├── .gitignore (⚠️ doit inclure credentials/ et .claude.json)
├── .claude.json (⚠️ NE PAS COMMITER - contient les secrets)
├── notion-import/ (données Notion)
├── google-drive-integration/
│   ├── docs/
│   │   └── GUIDE-CONFIGURATION-GOOGLE-DRIVE.md (ce fichier)
│   └── credentials/ (⚠️ NE PAS COMMITER)
│       ├── .gitkeep (committé pour créer le dossier)
│       └── service-account.json (⚠️ NE PAS COMMITER)
└── sessions/
```

---

## Synchro Notion ↔ Google Drive

Une fois Notion et Google Drive configurés, vous pouvez :

1. **Importer depuis Notion vers Google Drive** :
   - "Lis mes personnages depuis Notion et crée un Google Doc récapitulatif"

2. **Synchroniser les données** :
   - "Compare les informations de Phandalin entre Notion et Google Drive"

3. **Sauvegardes automatiques** :
   - "Exporte toutes mes fiches de personnages Notion vers Google Drive au format Markdown"

---

## Références

- [Package mcp-google-drive sur npm](https://www.npmjs.com/package/mcp-google-drive)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Service Accounts Overview](https://cloud.google.com/iam/docs/service-accounts)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## Support

Si vous rencontrez des problèmes :

1. Vérifiez d'abord la section **Troubleshooting** ci-dessus
2. Consultez les logs de VS Code : `View` > `Output` > sélectionnez "Claude Code"
3. Vérifiez que toutes les étapes ont été suivies dans l'ordre
4. Assurez-vous que les permissions sont correctes sur les fichiers credentials

---

**Version du guide** : Mise à jour janvier 2026
**Package utilisé** : `mcp-google-drive@1.6.2`
**Méthode d'authentification** : Service Account (recommandé pour la simplicité)
