# Intégration Google Drive pour la campagne Phandelver

Ce répertoire contient la configuration et la documentation pour l'intégration Google Drive avec Claude Code.

## 📁 Structure

```
google-drive-integration/
├── docs/
│   └── GUIDE-CONFIGURATION-GOOGLE-DRIVE.md  # Guide complet de configuration
├── credentials/
│   ├── .gitkeep                              # Garde le dossier dans Git
│   └── credentials.json                      # ⚠️ À créer (non versionné)
└── README.md                                  # Ce fichier
```

## 🚀 Démarrage rapide

1. **Lisez le guide complet** : [GUIDE-CONFIGURATION-GOOGLE-DRIVE.md](docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md)

2. **Créez vos credentials Google Cloud** :
   - Suivez les étapes 1-2 du guide
   - Téléchargez le fichier JSON des credentials
   - Placez-le dans `credentials/credentials.json`

3. **Configurez Claude Code** :
   - Éditez `~/.claude.json` pour ajouter le serveur MCP Google Drive
   - Exemple de configuration fourni dans le guide

4. **Redémarrez VS Code** et autorisez l'accès à votre compte Google

## 📋 Utilisation recommandée

### Structure Google Drive suggérée

```
📁 Phandelver Campaign/
├── 📁 Characters/        # Fiches de personnages
├── 📁 Locations/         # Descriptions des lieux
├── 📁 Sessions/          # Notes de sessions
├── 📁 Maps/              # Cartes et plans
└── 📁 Resources/         # Ressources diverses
```

### Exemples de commandes Claude

Une fois configuré, vous pouvez demander à Claude :

```
"Liste les fichiers dans mon dossier Phandelver Campaign"
"Lis le document Session 01 - Notes"
"Crée un nouveau document de session"
"Cherche les fichiers sur Phandalin dans Google Drive"
```

## 🔄 Synchronisation Notion ↔ Google Drive

Ce projet utilise aussi Notion (voir `notion-import/`). Vous pouvez :

- **Importer** des données Notion vers Google Drive
- **Synchroniser** les informations entre les deux plateformes
- **Sauvegarder** automatiquement des données Notion dans Google Drive

Exemples :
```
"Exporte les personnages de Notion vers Google Drive"
"Compare les infos de Phandalin entre Notion et Google Drive"
"Crée un backup Google Drive de toutes mes pages Notion"
```

## ⚠️ Sécurité

**IMPORTANT** : Les fichiers suivants sont ignorés par Git (voir `.gitignore`) :

- `credentials/credentials.json` - Vos credentials OAuth/Service Account
- `*-token.json` - Tokens d'authentification
- `.claude.json` - Configuration locale avec chemins sensibles

**Ne commitez JAMAIS ces fichiers !**

## 🆘 Support

En cas de problème :

1. Consultez la section **Troubleshooting** du guide
2. Vérifiez que l'API Google Drive est activée dans Google Cloud Console
3. Vérifiez les logs VS Code (View > Output > "Claude Code")
4. Relisez les étapes de configuration

## 📚 Ressources

- [Guide de configuration complet](docs/GUIDE-CONFIGURATION-GOOGLE-DRIVE.md)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Note** : Cette intégration utilise le protocole MCP (Model Context Protocol) pour connecter Claude Code à Google Drive de manière sécurisée.
