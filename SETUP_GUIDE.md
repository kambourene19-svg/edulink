# Guide d'Installation et de Démarrage - EduLink

Puisque Node.js n'était pas installé lors de la création initiale, voici les étapes à suivre une fois que vous l'aurez installé.

## 1. Prérequis
- Installer **Node.js** (LTS) : [https://nodejs.org/](https://nodejs.org/)
- Vérifier l'installation : Ouvrez un terminal et tapez `node -v` et `npm -v`.

## 2. Installation du Backend (Serveur)

Ouvrez votre terminal dans le dossier `server` :
```bash
cd server
npm install
```

### Base de Données
Ce projet utilise Prisma avec PostgreSQL. Pour faire simple en développement local, vous pouvez utiliser SQLite (si vous changez le provider) ou installer PostgreSQL.
Pour l'instant, configurez votre fichier `.env` à la racine de `server` :

Créez un fichier `.env` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/edulink?schema=public"
JWT_SECRET="votre_secret_tres_long_et_securise"
PORT=3000
```
*Note : Si vous n'avez pas PostgreSQL, vous pouvez changer `provider = "postgresql"` en `provider = "sqlite"` dans `server/prisma/schema.prisma` et mettre `DATABASE_URL="file:./dev.db"`.*

Lancez la migration DB (création des tables) :
```bash
npx prisma generate
npx prisma db push
```

### Démarrage Serveur
```bash
npm run dev
```
Le serveur tournera sur `http://localhost:3000`.

## 3. Installation du Frontend (Client)

Ouvrez un **nouveau terminal** dans le dossier `client` :
```bash
cd client
npm install
```

### Démarrage Client
```bash
npm run dev
```
Le site sera accessible sur `http://localhost:5173` (ou port similaire indiqué).

## 4. Utilisation
1. Allez sur le site Client.
2. Créez un compte élève via "Inscription".
3. Connectez-vous.
4. Accédez au Dashboard.

## Architecture des Dossiers

- **/server** : API Node.js/Express
  - `src/controllers` : Logique métier (Auth, Documents)
  - `src/routes` : Définition des URLs API
  - `prisma/schema.prisma` : Modèle de données
- **/client** : React + Vite
  - `src/pages` : Vues (Login, Dashboard)
  - `src/context` : Gestion de l'état utilisateur (Auth)
  - `src/api` : Configuration Axios

Bon développement !
