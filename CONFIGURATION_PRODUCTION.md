# 🔧 Configuration de Production - Admin ODL

## ⚠️ Problème : Erreur "Failed to fetch" après déploiement

Si vous rencontrez l'erreur `Failed to fetch` après le déploiement, c'est que l'application admin essaie de se connecter à `http://localhost:8080` au lieu de l'URL de production.

## ✅ Solution : Configurer la variable d'environnement

### Option 1 : Configuration dans AWS Amplify (Recommandé)

1. **Accédez à la console AWS Amplify**
   - Allez sur https://console.aws.amazon.com/amplify
   - Sélectionnez votre application admin

2. **Configurez les variables d'environnement**
   - Allez dans **App settings** > **Environment variables**
   - Cliquez sur **Manage variables**
   - Ajoutez la variable suivante :
     ```
     Variable name: NEXT_PUBLIC_API_URL
     Value: https://api.smart-odc.com
     ```
   - Cliquez sur **Save**

3. **Redéployez l'application**
   - Allez dans **App settings** > **Build settings**
   - Cliquez sur **Redeploy this version** ou faites un nouveau commit

### Option 2 : Fichier .env.production (Alternative)

Si vous préférez utiliser un fichier `.env.production` :

1. Créez un fichier `.env.production` à la racine du projet admin :
   ```env
   NEXT_PUBLIC_API_URL=https://api.smart-odc.com
   ```

2. **Note** : Ce fichier doit être ajouté au dépôt Git si vous voulez qu'il soit utilisé lors du build.

## 🔍 Vérification

Après la configuration, vérifiez que :

1. La variable d'environnement est bien définie dans Amplify
2. L'application a été redéployée
3. Les appels API pointent vers `https://api.smart-odc.com/awsodclearning`

## 🧪 Test en local

Pour tester en local avec l'API de production :

1. Créez un fichier `.env.local` à la racine du projet :
   ```env
   NEXT_PUBLIC_API_URL=https://api.smart-odc.com
   ```

2. Redémarrez le serveur de développement :
   ```bash
   pnpm dev
   ```

## 📝 Configuration actuelle

- **URL par défaut** : `https://api.smart-odc.com` (modifiée dans `services/api.config.ts`)
- **Context path** : `/awsodclearning`
- **URL complète** : `https://api.smart-odc.com/awsodclearning`

## ⚙️ Variables d'environnement disponibles

| Variable | Description | Valeur par défaut | Production |
|----------|-------------|-------------------|------------|
| `NEXT_PUBLIC_API_URL` | URL de base de l'API backend | `https://api.smart-odc.com` | `https://api.smart-odc.com` |

## 🔗 URLs importantes

- **Backend API** : `https://api.smart-odc.com/awsodclearning`
- **Admin** : `https://admin.smart-odc.com`
- **Frontend** : `https://pi.smart-odc.com` (ou autre URL selon votre configuration)

## 🆘 Dépannage

### Erreur CORS
Si vous avez des erreurs CORS, vérifiez que `https://admin.smart-odc.com` est bien dans la liste des origines autorisées dans le backend (`SecurityConfiguration.java`).

### Erreur 404
Vérifiez que le context path `/awsodclearning` est bien inclus dans l'URL.

### Erreur de connexion
Vérifiez que :
- Le backend est bien déployé et accessible
- L'URL dans la variable d'environnement est correcte
- Il n'y a pas de problème de réseau/firewall

