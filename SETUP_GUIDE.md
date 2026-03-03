# Guide de Lancement - FasoTicket

Ce projet est une solution complète de billetterie pour le transport interurbain au Burkina Faso.

## Prérequis
- Node.js (v18+)
- SQLite (inclus) ou PostgreSQL (optionnel)

## Structure
- `/server` : API Node.js/Express + Prisma
- `/client` : Tableau de bord Admin (React/Vite)
- `/mobile` : Application Voyageur (React Native/Expo)

## 1. Démarrer le Backend (API)
```bash
cd server
npm install
npx prisma migrate dev --name init # Première fois seulement
npm run dev
```
L'API sera accessible sur `http://localhost:3000`.

## 2. Démarrer le Dashboard Admin
```bash
cd client
npm install
npm run dev
```
Accédez à `http://localhost:5173`.
Compte Admin par défaut : À créer via l'API ou directement dans la base de données.
Vous pouvez vous inscrire via l'API `/api/auth/register` (utiliser Postman ou Curl pour créer le premier admin).

## 3. Démarrer l'App Mobile
```bash
cd mobile
npm install
npx expo start
```
Scanner le QR code avec l'application Expo Go sur votre Android.

## Notes Importantes
- **Base de Données** : Par défaut en SQLite (`dev.db`). Pour la prod, changez `logging` dans `server/prisma/schema.prisma` vers `postgresql`.
- **Paiement** : L'intégration CinetPay est simulée. Voir `server/src/controllers/bookingController.ts` pour la logique.

## API Endpoints Clés
- `POST /api/auth/register` : Créer un compte
- `POST /api/auth/login` : Se connecter
- `GET /api/companies` : Lister les compagnies
- `POST /api/companies` : Créer une compagnie
- `GET /api/bookings/search` : Rechercher un trajet
