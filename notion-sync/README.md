# Notion → Markdown Sync

Script de synchronisation automatique pour exporter votre contenu Notion vers des fichiers Markdown locaux. Conçu pour le projet PhandelverAndBelow (campagne D&D), mais entièrement personnalisable pour d'autres usages.

## Fonctionnalités

- 🔄 **Synchronisation complète ou incrémentale** - Ne synchronise que les pages modifiées
- 📁 **Organisation automatique** - Mappez les types de pages Notion vers des dossiers locaux
- 🎯 **YAML frontmatter** - Génère automatiquement les métadonnées au format YAML
- 🌳 **Export récursif** - Exporte les pages et toutes leurs sous-pages
- ⚡ **Rate limiting intelligent** - Respecte les limites de l'API Notion (3 req/sec)
- 🔁 **Retry automatique** - Gère les erreurs réseau avec backoff exponentiel
- 🎨 **Interface CLI colorée** - Progression claire et messages informatifs

## Installation

```bash
cd notion-sync
npm install
```

## Configuration

### 1. Obtenir une clé API Notion

1. Allez sur [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Cliquez sur "New integration"
3. Donnez-lui un nom (ex: "PhandelverAndBelow Sync")
4. Sélectionnez le workspace
5. Copiez le "Internal Integration Token" (commence par `secret_`)

### 2. Partager vos pages avec l'intégration

Pour chaque page Notion que vous voulez synchroniser :

1. Ouvrez la page dans Notion
2. Cliquez sur "..." (menu) → "Connections" → "Add connections"
3. Sélectionnez votre intégration

**Important** : L'intégration ne peut accéder qu'aux pages qui lui sont explicitement partagées.

### 3. Configurer le script

```bash
npm run init
```

Cela crée un fichier `.env` depuis `.env.example`. Ensuite :

```bash
nano .env  # ou votre éditeur préféré
```

Ajoutez votre clé API :

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Trouver l'ID d'une page Notion

1. Ouvrez la page dans Notion
2. Cliquez sur "Share" → "Copy link"
3. L'URL ressemble à : `https://www.notion.so/Page-Title-1dc3c30f06bf81c3b6ead5987c47ca4d`
4. L'ID est la dernière partie : `1dc3c30f06bf81c3b6ead5987c47ca4d`

## Utilisation

### Première synchronisation

```bash
npm run sync
```

Par défaut, cela synchronise toutes les pages accessibles dans votre workspace Notion vers `../notion-import/`.

### Synchroniser uniquement les aventures (13 pages)

```bash
npm run sync:adventures
```

Cela synchronise les 13 pages d'aventures depuis la page "Adventures" vers `../notion-import/adventures/`.

### Synchronisation incrémentale (seulement les changements)

```bash
npm run sync -- --incremental
```

Ne synchronise que les pages modifiées depuis la dernière synchronisation.

### Synchroniser depuis une page spécifique

```bash
npm run sync -- --root <page-id>
```

Exemple :
```bash
npm run sync -- --root 1dc3c30f-06bf-81c3-b6ea-d5987c47ca4d
```

### Synchroniser des pages spécifiques

```bash
npm run sync -- --pages <id1>,<id2>,<id3>
```

### Options disponibles

```bash
npm run sync -- [options]

Options:
  --root <pageId>       Sync depuis une page root spécifique
  --pages <pageIds>     Sync pages spécifiques (IDs séparés par virgules)
  --incremental         Sync incrémentale (seulement pages modifiées)
  --force               Forcer sync complète (ignore le cache)
  --output <dir>        Dossier de sortie personnalisé
  --config <file>       Fichier de config personnalisé
  --verbose             Logs détaillés
  --dry-run             Prévisualiser sans écrire les fichiers
```

### Voir le statut

```bash
npm run status
```

Affiche les statistiques de la dernière synchronisation.

### Forcer une resynchronisation complète

```bash
npm run sync -- --force
```

Ou effacer le cache :

```bash
node src/index.js clear
npm run sync
```

## Structure de sortie

```
notion-import/
├── adventures/          # Pages d'aventures
│   ├── les-ombres-de-nyx-ma.md
│   ├── chateau-de-cragmaw.md
│   └── ...
├── personnages/
│   ├── joueurs/        # PCs (Player Characters)
│   ├── phandalin/      # NPCs de Phandalin
│   ├── antagonistes/   # Villains
│   └── autres/         # Autres personnages
├── lieux/              # Locations
├── factions/           # Factions/Organizations
└── sessions/           # Session notes
```

## Format des fichiers générés

Chaque fichier markdown contient :

**1. YAML frontmatter** avec métadonnées :

```yaml
---
nom: "Chateau de Cragmaw"
type: "Dungeon"
role: null
faction: null
lieu: null
gender: null
notion_id: "2a33c30f-06bf-80c8-898e-e33c6cad50c4"
notion_url: "https://www.notion.so/..."
---
```

**2. Titre H1** :

```markdown
# Chateau de Cragmaw
```

**3. Contenu markdown** :

```markdown
## Description

Le château de Cragmaw est...

## Zones principales

### Zone 1: Entrée

...
```

## Configuration avancée

### Personnaliser le mapping des types de pages

Éditez `config/page-mapping.json` :

```json
{
  "mappingRules": [
    {
      "condition": {
        "parent": "page-id-adventures"
      },
      "output": "adventures",
      "filenamePattern": "{title}"
    },
    {
      "condition": {
        "property": "Role",
        "value": "PC"
      },
      "output": "personnages/joueurs",
      "filenamePattern": "{title}"
    }
  ],
  "defaultOutput": "misc"
}
```

### Personnaliser le frontmatter

Éditez `config/sync-config.json` :

```json
{
  "frontmatterMapping": {
    "Title": "nom",
    "Race": "race",
    "Type": "type",
    "Role": "role",
    "Faction": "faction",
    "Location": "lieu",
    "Gender": "gender"
  }
}
```

Les clés sont les noms des propriétés dans Notion, les valeurs sont les champs YAML.

## Dépannage

### Erreur : `NOTION_API_KEY not found`

Solution :
1. Vérifiez que le fichier `.env` existe dans `notion-sync/`
2. Vérifiez que la clé commence par `secret_`
3. Pas d'espaces autour du `=` : `NOTION_API_KEY=secret_xxx`

### Erreur : `object_not_found`

Solution :
- La page n'est pas partagée avec votre intégration
- Ouvrez la page dans Notion → "..." → "Add connections" → Sélectionnez votre intégration

### Erreur : `restricted_resource`

Solution :
- Votre intégration n'a pas les permissions nécessaires
- Allez sur [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
- Cliquez sur votre intégration → "Capabilities"
- Assurez-vous que "Read content" est activé

### Aucune page trouvée

Solution :
- Utilisez `--root <page-id>` pour partir d'une page spécifique
- Vérifiez que les pages sont partagées avec l'intégration
- Utilisez `--verbose` pour voir les logs détaillés

### Rate limiting (trop de requêtes)

Le script respecte automatiquement la limite de 3 requêtes/seconde de Notion. Si vous voyez des erreurs de rate limiting :
- Le script va automatiquement retry
- Patientez quelques secondes entre les syncs

## Architecture

```
src/
├── index.js                    # CLI entry point
├── config.js                   # Configuration loader
├── notion/
│   ├── client.js              # Notion API wrapper
│   ├── explorer.js            # Page discovery
│   └── blocks-to-markdown.js  # Markdown conversion
├── markdown/
│   ├── frontmatter.js         # YAML frontmatter
│   └── generator.js           # File generation
├── sync/
│   ├── sync-manager.js        # Main orchestrator
│   ├── change-detector.js     # Incremental sync
│   └── file-mapper.js         # Path mapping
└── utils/
    ├── logger.js              # Colored logging
    ├── file-system.js         # File operations
    └── string-utils.js        # String helpers
```

## FAQ

### Que se passe-t-il si je modifie un fichier local ?

Le script écrase toujours les fichiers locaux avec le contenu de Notion. Pour préserver des changements locaux, modifiez-les dans Notion.

### Comment exclure certaines pages ?

Actuellement, le script synchronise toutes les pages accessibles. Pour exclure des pages :
- Ne les partagez pas avec l'intégration, OU
- Utilisez `--root` ou `--pages` pour synchroniser sélectivement

### Puis-je synchroniser plusieurs workspaces ?

Oui, créez plusieurs intégrations avec des clés API différentes, et lancez le script avec différents fichiers `.env` ou `--config`.

### Le script gère-t-il les images ?

Oui, les images sont référencées par leur URL Notion dans le markdown (`![alt](https://notion.so/...)`). Les URLs sont temporaires et expirent après quelques heures, mais sont régénérées à chaque sync.

### Puis-je sync vers Google Drive ?

Le script synchronise vers le système de fichiers local. Pour sync vers Google Drive :
1. Installez Google Drive Desktop
2. Configurez `outputDir` vers votre dossier Google Drive

### Quelle est la fréquence de sync recommandée ?

- **Manuel** : Lancez après chaque session de jeu ou modification importante
- **Automatique** : Créez une tâche cron pour sync quotidienne :
  ```bash
  # Dans crontab -e
  0 2 * * * cd /path/to/PhandelverAndBelow/notion-sync && npm run sync -- --incremental
  ```

## Support

Pour les bugs ou questions :
- Vérifiez la section Dépannage ci-dessus
- Lancez avec `--verbose` pour voir les logs détaillés
- Consultez les logs dans la console

## Licence

MIT
