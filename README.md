# Les Tréfonds de Phancreux - Campagne D&D

Système de gestion de campagne D&D pour "Phandelver and Below: The Shattered Obelisk" avec intégrations Notion et Google Drive via Claude Code.

## 📖 À propos

Cette campagne D&D utilise Claude Code (extension VS Code) pour gérer de manière collaborative :

- **Personnages** (joueurs, antagonistes, NPCs, membres de factions)
- **Lieux** (Phandalin, Thundertree, Wave Echo Cave, etc.)
- **Factions** et leurs relations
- **Sessions** et introductions narratives
- **Relations** entre personnages et lore de la campagne

## 🏗️ Structure du projet

```
PhandelverAndBelow/
├── notion-import/              # Données exportées depuis Notion
│   ├── docs/
│   │   └── GUIDE-CONFIGURATION-NOTION.md
│   ├── personnages/            # 32 personnages (joueurs, NPCs, antagonistes)
│   ├── lieux/                  # 8 lieux de la campagne
│   └── factions/               # Factions et organisations
├── notion-sync/                # Synchronisation Notion → Markdown
│   └── README.md               # Guide de synchronisation
├── google-drive-integration/   # Configuration Google Drive
│   ├── docs/
│   │   └── GUIDE-CONFIGURATION-GOOGLE-DRIVE.md
│   ├── credentials/            # Credentials Google (non versionnés)
│   └── .claude.json.example    # Exemple de configuration MCP
├── chatgpt-assistant/          # Assistant ChatGPT pour préparer les sessions
│   ├── README.md               # Documentation complète
│   ├── QUICKSTART.md           # Guide de démarrage rapide
│   └── EXAMPLES.md             # Exemples d'utilisation
├── sessions/                   # Notes et introductions de sessions
├── .gitignore                  # Exclut les credentials et tokens
└── README.md                   # Ce fichier
```

## 🚀 Démarrage rapide

### Prérequis

- **Node.js v24** (voir `.nvmrc`)
- **VS Code** avec l'extension Claude Code
- **Git** pour le versioning

```bash
# Installer la bonne version de Node.js avec nvm
nvm install 24
nvm use 24
```

### Configuration des intégrations

#### 1. Notion (déjà configuré)

✅ L'intégration Notion est déjà active avec des données exportées.

📖 Voir le guide complet : [notion-import/docs/GUIDE-CONFIGURATION-NOTION.md](docs/GUIDE-CONFIGURATION-NOTION.md)

#### 2. Google Drive (nouveau !)

🆕 Pour connecter Google Drive à votre campagne :

1. **Lisez le guide** : [google-drive-integration/docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md](google-drive-integration/docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md)
2. **Créez vos credentials** Google Cloud
3. **Configurez le serveur MCP** dans `~/.claude.json`
4. **Redémarrez VS Code** et autorisez l'accès

📖 Guide complet : [google-drive-integration/docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md](google-drive-integration/docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md)

## 🎮 Utilisation avec Claude Code

### Exemples de commandes Notion

```
"Cherche mes pages Notion sur Phandalin"
"Lis la fiche du personnage Gundren Rockseeker"
"Crée une nouvelle page Notion pour le PNJ Sildar Hallwinter"
"Liste tous les personnages de la faction Circle of Light"
```

### Exemples de commandes Google Drive

```
"Liste les fichiers dans mon dossier Phandelver Campaign"
"Lis le document Session 01 - Notes dans Google Drive"
"Crée un nouveau document de session dans Google Drive"
"Cherche les cartes de Phandalin dans Google Drive"
```

### Synchronisation Notion ↔ Google Drive

```
"Exporte les personnages de Notion vers Google Drive"
"Compare les infos de Phandalin entre Notion et Google Drive"
"Crée un backup Google Drive de mes pages Notion"
```

## 📊 Données de la campagne

### Personnages (32)

- **Joueurs** (4) : Personnages jouables
- **Antagonistes** (3) : Vilains principaux
- **Phandalin** : NPCs du village
- **Autres** : Personnages secondaires

Exemple de structure YAML :

```yaml
---
nom: "Gundren Rockseeker"
type: "PNJ"
race: "Nain"
role: "Allié"
faction: "Rockseeker Brothers"
lieu: "Phandalin"
notion_id: "uuid-here"
notion_url: "https://www.notion.so/..."
---
```

### Lieux (8)

- Phandalin (village principal)
- Wave Echo Cave
- Thundertree
- Redbrand Hideout
- Cragmaw Castle
- Et plus...

### Factions

- Circle of Light
- Rockseeker Brothers
- Redbrands
- Lords' Alliance
- Et autres...

## 🔐 Sécurité

**⚠️ IMPORTANT** : Les fichiers suivants sont exclus de Git :

- `credentials.json` - Credentials OAuth Google
- `*-token.json` - Tokens d'authentification
- `.claude.json` - Configuration locale Claude Code

**Ne commitez JAMAIS ces fichiers sensibles !**

Voir [.gitignore](.gitignore) pour la liste complète.

## 🛠️ Développement

### Branches

- `main` - Branche principale stable
- `claude/google-drive-integration-Slvzo` - Intégration Google Drive (actuelle)
- `claude/connect-onedrive-integration-9fOCe` - Intégration OneDrive

### Commits

Suivez les conventions de commits :

```
feat: add Google Drive integration
docs: update configuration guides
fix: correct credential path in example
```

### Workflow Git

```bash
# Vérifier le status
git status

# Ajouter les changements
git add .

# Commiter
git commit -m "feat: add Google Drive integration"

# Pousser vers la branche de feature
git push -u origin claude/google-drive-integration-Slvzo
```

## 📚 Ressources

### Documentation des intégrations

- [Guide Notion](notion-import/docs/GUIDE-CONFIGURATION-NOTION.md)
- [Guide Google Drive](google-drive-integration/docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md)

### APIs et outils

- [Notion API](https://developers.notion.com/)
- [Google Drive API](https://developers.google.com/drive/api)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Code](https://docs.anthropic.com/claude/docs/claude-code)

### D&D Resources

- [D&D Beyond](https://www.dndbeyond.com/)
- [Phandelver and Below Module](https://www.dndbeyond.com/sources/phandelver)

## 🤝 Contribution

Ce projet est géré collaborativement avec Claude Code. Pour contribuer :

1. Créez une branche de feature (`claude/your-feature-name-xxxxx`)
2. Faites vos modifications
3. Commitez avec des messages clairs
4. Poussez vers votre branche
5. Créez une Pull Request si nécessaire

## 📝 License

Ce projet est à usage personnel pour une campagne D&D. Le contenu D&D est la propriété de Wizards of the Coast.

---

**Version** : 1.0.0
**Dernière mise à jour** : 2026-01-13
**Maintenu avec** : Claude Code + VS Code
