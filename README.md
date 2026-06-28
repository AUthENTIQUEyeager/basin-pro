# BazinPro — Logiciel de gestion pour vendeurs de bazin

> Application SaaS multi-tenant pour la gestion de boutiques de bazin au Burkina Faso.
> Stack : React + Vite + TailwindCSS · NestJS · Supabase PostgreSQL · Vercel + Render

---

## Table des matières

1. [Architecture générale](#architecture)
2. [Structure du projet](#structure)
3. [Frontend — Déploiement sur Vercel](#frontend-vercel)
4. [Backend — Déploiement sur Render](#backend-render)
5. [Base de données — Supabase](#base-de-données)
6. [Variables d'environnement](#variables-denvironnement)
7. [Mode hors ligne](#mode-hors-ligne)
8. [Abonnements & licences](#abonnements)
9. [Super Admin](#super-admin)
10. [Checklist de mise en production](#checklist)
11. [Coûts estimés](#coûts)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    UTILISATEUR                       │
│          Navigateur (PWA) / Tablette / Mobile        │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
              ┌──────────▼──────────┐
              │     VERCEL CDN      │
              │   React + Vite SPA  │
              │  (app.bazinpro.com) │
              └──────────┬──────────┘
                         │ REST API (JWT)
              ┌──────────▼──────────┐
              │      RENDER         │
              │   NestJS API REST   │
              │  (api.bazinpro.com) │
              └──────┬──────┬───────┘
                     │      │
          ┌──────────▼──┐ ┌─▼──────────────┐
          │  SUPABASE   │ │ SUPABASE       │
          │  PostgreSQL │ │ Storage        │
          │  (données)  │ │ (logos, reçus) │
          └─────────────┘ └────────────────┘
```

---

## Structure du projet

```
bazinpro/
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Sidebar.tsx        # Navigation latérale
│   │       └── Topbar.tsx         # Barre du haut + sync
│   ├── pages/
│   │   ├── LoginPage.tsx          # Authentification
│   │   ├── DashboardPage.tsx      # Tableau de bord
│   │   ├── VentePage.tsx          # Caisse / POS
│   │   ├── StockPage.tsx          # Gestion du stock
│   │   ├── HistoriquePage.tsx     # Historique des ventes
│   │   ├── ClientsPage.tsx        # Fiches clients
│   │   ├── RapportsPage.tsx       # Rapports & analytics
│   │   ├── DepensesPage.tsx       # Suivi des dépenses
│   │   ├── ParametresPage.tsx     # Qualités, couleurs, boutique
│   │   └── SystemPages.tsx        # Utilisateurs, Sync, Sauvegarde
│   ├── stores/
│   │   └── appStore.ts            # Zustand — état global + persistance
│   ├── types/
│   │   └── index.ts               # Types TypeScript complets
│   └── lib/
│       ├── utils.ts               # Fonctions utilitaires
│       └── mockData.ts            # Données de démonstration
├── bundle.html                    # Build standalone (tout-en-un, aucune dépendance)
├── index.html
├── vite.config.ts
└── README.md
```

---

## Frontend — Déploiement sur Vercel

### Prérequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Repository GitHub contenant le projet

### 1. Pousser sur GitHub

```bash
cd bazinpro
git init
git add .
git commit -m "feat: initial BazinPro"
git remote add origin https://github.com/TON_COMPTE/bazinpro-frontend.git
git push -u origin main
```

### 2. Connecter à Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Cliquer **"Import Git Repository"**
3. Sélectionner le repo `bazinpro-frontend`
4. Vercel détecte automatiquement **Vite**

### 3. Configuration build (vercel.json)

Créer `vercel.json` à la racine du projet :

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Le rewrite est **obligatoire** pour que le routage React fonctionne.

### 4. Variables d'environnement Vercel

Dans **Settings > Environment Variables** :

| Nom | Valeur |
|-----|--------|
| `VITE_API_URL` | `https://bazinpro-api.onrender.com` |
| `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
| `VITE_APP_VERSION` | `1.0.0` |

### 5. Domaine personnalisé (optionnel)

Dans **Settings > Domains** de ton projet Vercel :

1. Ajouter `app.bazinpro.com`
2. Configurer les DNS chez ton registrar :

```
Type  : CNAME
Nom   : app
Valeur: cname.vercel-dns.com
TTL   : Auto
```

### 6. Déploiements automatiques

Chaque `git push origin main` déclenche un redéploiement automatique.
Les Pull Requests génèrent des **Preview URLs** uniques pour les tests.

---

## Backend — Déploiement sur Render

### Structure NestJS recommandée

```
backend/
├── src/
│   ├── auth/              # JWT + Bcrypt + Guards
│   ├── boutiques/         # Gestion des tenants
│   ├── tissus/            # Stock
│   ├── ventes/            # Transactions POS
│   ├── clients/           # CRM
│   ├── depenses/          # Dépenses
│   ├── rapports/          # Analytics & agrégats
│   ├── sync/              # File de synchronisation hors-ligne
│   ├── abonnements/       # Licences & expiration
│   └── super-admin/       # Interface d'administration globale
├── prisma/
│   └── schema.prisma
└── Dockerfile
```

### 1. Créer un Web Service sur Render

1. Aller sur [render.com](https://render.com) → **New > Web Service**
2. Connecter le repo GitHub backend
3. Paramétrer :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `bazinpro-api` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `node dist/main.js` |
| **Instance Type** | `Starter ($7/mois)` |
| **Health Check Path** | `/health` |
| **Auto-Deploy** | `Yes` |

### 2. Variables d'environnement Render

Dans **Dashboard > Environment** :

```
NODE_ENV=production
PORT=3000

# Base de données Supabase
DATABASE_URL=postgresql://postgres:[MOT_DE_PASSE]@db.[PROJECT_ID].supabase.co:5432/postgres

# JWT — générer avec: openssl rand -hex 64
JWT_SECRET=remplacer_par_secret_aléatoire_64_chars_minimum
JWT_EXPIRES_IN=7d

# Supabase (côté serveur)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...

# CORS — domaine(s) autorisé(s)
CORS_ORIGIN=https://bazinpro.vercel.app,https://app.bazinpro.com

# Mailer (optionnel — rappels d'abonnement)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@bazinpro.com
SMTP_PASS=mot_de_passe_smtp
```

### 3. Dockerfile (recommandé)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 4. Endpoint de santé

Ajouter dans NestJS (`src/health/health.controller.ts`) :

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

---

## Base de données — Supabase

### 1. Créer le projet Supabase

1. Aller sur [supabase.com](https://supabase.com) → **New project**
2. Choisir la région **Europe West (Frankfurt)** pour réduire la latence
3. Définir un mot de passe fort pour PostgreSQL
4. Attendre ~2 minutes que le projet soit prêt

### 2. Schéma PostgreSQL complet

Dans **SQL Editor** de Supabase, exécuter :

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Boutiques (tenants) ───────────────────────────────────────────────────
CREATE TABLE boutiques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(200) NOT NULL,
  adresse TEXT,
  telephone VARCHAR(20),
  logo_url TEXT,
  abonnement_statut VARCHAR(20) DEFAULT 'actif'
    CHECK (abonnement_statut IN ('actif','suspendu','expire')),
  abonnement_debut DATE DEFAULT CURRENT_DATE,
  abonnement_fin DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Utilisateurs ──────────────────────────────────────────────────────────
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'caissier'
    CHECK (role IN ('manager','caissier')),
  actif BOOLEAN DEFAULT TRUE,
  derniere_connexion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Qualités ──────────────────────────────────────────────────────────────
CREATE TABLE qualites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Couleurs ──────────────────────────────────────────────────────────────
CREATE TABLE couleurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  hex CHAR(7) DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tissus (stock) ────────────────────────────────────────────────────────
CREATE TABLE tissus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  qualite_id UUID REFERENCES qualites(id),
  couleur_id UUID REFERENCES couleurs(id),
  metrage_disponible DECIMAL(10,2) NOT NULL DEFAULT 0,
  metrage_alerte DECIMAL(10,2) DEFAULT 5,
  prix_achat DECIMAL(10,0),
  prix_vente DECIMAL(10,0) NOT NULL,
  emplacement VARCHAR(100),
  observation TEXT,
  qr_code TEXT,
  statut VARCHAR(20) DEFAULT 'disponible'
    CHECK (statut IN ('disponible','bas','epuise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Clients ───────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  telephone VARCHAR(20),
  total_achats DECIMAL(12,0) DEFAULT 0,
  nb_achats INTEGER DEFAULT 0,
  derniere_visite TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Ventes ────────────────────────────────────────────────────────────────
CREATE TABLE ventes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  numero VARCHAR(30) UNIQUE NOT NULL,
  caissier_id UUID REFERENCES utilisateurs(id),
  client_id UUID REFERENCES clients(id),
  client_nom VARCHAR(100),
  client_prenom VARCHAR(100),
  client_telephone VARCHAR(20),
  montant_total DECIMAL(12,0) NOT NULL,
  mode_paiement VARCHAR(20)
    CHECK (mode_paiement IN ('especes','orange_money','wave','moov_money')),
  statut VARCHAR(20) DEFAULT 'validee'
    CHECK (statut IN ('validee','annulee','retour')),
  motif_annulation TEXT,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Lignes de vente ───────────────────────────────────────────────────────
CREATE TABLE lignes_vente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vente_id UUID REFERENCES ventes(id) ON DELETE CASCADE,
  tissu_id UUID REFERENCES tissus(id),
  tissu_code VARCHAR(20),
  qualite_nom VARCHAR(100),
  couleur_nom VARCHAR(100),
  metrage DECIMAL(10,2) NOT NULL,
  prix_unitaire DECIMAL(10,0) NOT NULL,
  montant DECIMAL(12,0) NOT NULL
);

-- ─── Dépenses ──────────────────────────────────────────────────────────────
CREATE TABLE depenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id) ON DELETE CASCADE,
  user_id UUID REFERENCES utilisateurs(id),
  categorie VARCHAR(100) NOT NULL,
  montant DECIMAL(12,0) NOT NULL,
  date DATE NOT NULL,
  observation TEXT,
  synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mouvements de stock ───────────────────────────────────────────────────
CREATE TABLE mouvements_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tissu_id UUID REFERENCES tissus(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES boutiques(id),
  type VARCHAR(20) CHECK (type IN ('entree','sortie','correction')),
  quantite DECIMAL(10,2) NOT NULL,
  motif TEXT,
  user_id UUID REFERENCES utilisateurs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Journal des actions ───────────────────────────────────────────────────
CREATE TABLE journal_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id),
  user_id UUID REFERENCES utilisateurs(id),
  action VARCHAR(100) NOT NULL,
  entite VARCHAR(50),
  entite_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── File de synchronisation ───────────────────────────────────────────────
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boutique_id UUID REFERENCES boutiques(id),
  operation VARCHAR(20) CHECK (operation IN ('CREATE','UPDATE','DELETE')),
  entite VARCHAR(50) NOT NULL,
  entite_id UUID,
  payload JSONB,
  statut VARCHAR(20) DEFAULT 'pending'
    CHECK (statut IN ('pending','processing','done','error')),
  tentatives INTEGER DEFAULT 0,
  erreur TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ─── Index de performance ──────────────────────────────────────────────────
CREATE INDEX idx_tissus_boutique ON tissus(boutique_id);
CREATE INDEX idx_tissus_statut ON tissus(boutique_id, statut);
CREATE INDEX idx_ventes_boutique_date ON ventes(boutique_id, created_at DESC);
CREATE INDEX idx_ventes_client ON ventes(client_id);
CREATE INDEX idx_ventes_statut ON ventes(boutique_id, statut);
CREATE INDEX idx_clients_boutique ON clients(boutique_id);
CREATE INDEX idx_depenses_boutique_date ON depenses(boutique_id, date DESC);
CREATE INDEX idx_sync_pending ON sync_queue(boutique_id, statut) WHERE statut = 'pending';
CREATE INDEX idx_journal_boutique ON journal_actions(boutique_id, created_at DESC);

-- ─── Trigger : updated_at automatique ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tissus_updated_at
  BEFORE UPDATE ON tissus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Trigger : mise à jour stats client ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NOT NULL AND NEW.statut = 'validee' THEN
    UPDATE clients SET
      total_achats = total_achats + NEW.montant_total,
      nb_achats = nb_achats + 1,
      derniere_visite = NEW.created_at
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vente_update_client
  AFTER INSERT ON ventes
  FOR EACH ROW EXECUTE FUNCTION update_client_stats();
```

### 3. Row Level Security (RLS) — isolation multi-tenant

```sql
-- Activer RLS sur toutes les tables métier
ALTER TABLE tissus      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE depenses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE couleurs    ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour récupérer la boutique de l'utilisateur connecté
CREATE OR REPLACE FUNCTION get_boutique_id()
RETURNS UUID AS $$
  SELECT boutique_id FROM utilisateurs WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Politiques d'isolation
CREATE POLICY "isolation_tissus" ON tissus
  FOR ALL USING (boutique_id = get_boutique_id());

CREATE POLICY "isolation_ventes" ON ventes
  FOR ALL USING (boutique_id = get_boutique_id());

CREATE POLICY "isolation_clients" ON clients
  FOR ALL USING (boutique_id = get_boutique_id());

CREATE POLICY "isolation_depenses" ON depenses
  FOR ALL USING (boutique_id = get_boutique_id());

-- Répéter pour qualites, couleurs, lignes_vente...
```

### 4. Récupérer les clés Supabase

Dans **Settings > API** du projet Supabase :

| Clé | Usage |
|-----|-------|
| `Project URL` | `VITE_SUPABASE_URL` (frontend + backend) |
| `anon public` | `VITE_SUPABASE_ANON_KEY` (frontend uniquement) |
| `service_role` | `SUPABASE_SERVICE_KEY` (backend uniquement — **ne jamais exposer**) |

---

## Variables d'environnement

### Frontend — `.env.production`

```env
VITE_API_URL=https://bazinpro-api.onrender.com
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=BazinPro
VITE_APP_VERSION=1.0.0
```

### Backend — `.env`

```env
NODE_ENV=production
PORT=3000

# PostgreSQL Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

# JWT — générer : openssl rand -hex 64
JWT_SECRET=votre_secret_aléatoire_très_long_minimum_64_caractères
JWT_EXPIRES_IN=7d

# Supabase Admin
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# CORS
CORS_ORIGIN=https://bazinpro.vercel.app,https://app.bazinpro.com

# Notifications par email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@bazinpro.com
SMTP_PASS=mot_de_passe_application

# Super Admin
SUPER_ADMIN_EMAIL=admin@authentique-studio.com
SUPER_ADMIN_PASSWORD_HASH=[bcrypt hash]
```

---

## Mode hors ligne

### Architecture de synchronisation

```
┌─────────────────────────────────────────────────────┐
│                   NAVIGATEUR                         │
│                                                      │
│  ┌──────────┐    ┌──────────────┐    ┌───────────┐  │
│  │  UI React│───▶│ Zustand Store│───▶│ IndexedDB │  │
│  └──────────┘    └──────┬───────┘    └─────┬─────┘  │
│                         │                  │         │
│                  ┌──────▼───────┐          │         │
│                  │ Sync Service │◀─────────┘         │
│                  └──────┬───────┘                    │
│                         │ (si connecté)              │
└─────────────────────────┼───────────────────────────┘
                          │ HTTPS
                   ┌──────▼──────┐
                   │  Backend    │
                   │  NestJS     │
                   └─────────────┘
```

### Implémentation recommandée

**1. IndexedDB avec Dexie.js**

```typescript
// src/services/db.ts
import Dexie from 'dexie';

export class BazinProDB extends Dexie {
  tissus!: Dexie.Table;
  ventes!: Dexie.Table;
  syncQueue!: Dexie.Table;

  constructor() {
    super('BazinProDB');
    this.version(1).stores({
      tissus:    'id, code, boutique_id, statut',
      ventes:    'id, numero, boutique_id, created_at, synced',
      syncQueue: '++id, entite, operation, statut, created_at',
    });
  }
}

export const db = new BazinProDB();
```

**2. Service de synchronisation**

```typescript
// src/services/syncService.ts
export async function syncPendingOperations() {
  const pending = await db.syncQueue
    .where('statut').equals('pending').toArray();

  for (const op of pending) {
    try {
      await api.post('/sync', op);
      await db.syncQueue.update(op.id, { statut: 'done', synced_at: new Date() });
    } catch (err) {
      await db.syncQueue.update(op.id, {
        statut: 'error',
        tentatives: op.tentatives + 1,
        erreur: String(err),
      });
    }
  }
}

// Déclencher à la reconnexion
window.addEventListener('online', syncPendingOperations);
```

**3. Service Worker (PWA)**

```javascript
// public/sw.js
const CACHE_NAME = 'bazinpro-v1';
const OFFLINE_FALLBACK = '/offline.html';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/index.html', OFFLINE_FALLBACK])
    )
  );
});

self.addEventListener('fetch', (e) => {
  if (!navigator.onLine) {
    e.respondWith(caches.match(e.request) || caches.match(OFFLINE_FALLBACK));
  }
});
```

---

## Abonnements & licences

### Flux de vie d'un abonnement

```
Inscription boutique
        │
        ▼
Période d'essai (15 jours)
        │
        ▼
Paiement reçu → Abonnement ACTIF
        │
        ▼  (J-5, J-3, J-1 : email automatique)
Date d'expiration
        │
        ▼
Période de grâce (3 jours)
        │
   Payé ?
   ├── Oui → Réactivation immédiate
   └── Non → SUSPENDU
              │
              ├── Consultation données : autorisée
              ├── Nouvelles ventes : bloquées
              └── Après paiement → Réactivation immédiate
```

### Vérification côté frontend

```typescript
// src/hooks/useLicense.ts
export function useLicense() {
  const { boutique } = useAppStore();

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const { data } = await api.get('/boutiques/license-status');
        if (data.statut === 'suspendu') {
          // Afficher modal de renouvellement, bloquer POS
        }
      } catch {
        // Hors ligne — utiliser le statut local
      }
    };

    checkLicense();
    const interval = setInterval(checkLicense, 60 * 60 * 1000); // toutes les heures
    return () => clearInterval(interval);
  }, []);
}
```

### Notifications automatiques (Backend NestJS)

```typescript
// Cron job — s'exécute chaque matin à 8h00
@Cron('0 8 * * *')
async sendExpirationReminders() {
  const boutiques = await this.boutiquesService.findExpiringIn([5, 3, 1]);
  for (const boutique of boutiques) {
    await this.mailerService.send({
      to: boutique.manager_email,
      subject: `BazinPro — Votre abonnement expire dans ${boutique.jours_restants} jour(s)`,
      template: 'expiration-reminder',
    });
  }
}
```

---

## Super Admin

L'interface Super Admin est une **application séparée** déployée sur un sous-domaine protégé.

- **URL** : `https://admin.bazinpro.com`
- **Accès** : email/mot de passe Super Admin uniquement (jamais accessible aux commerçants)
- **Déploiement** : Vercel (projet séparé) ou même projet Render avec route `/super-admin`

### Fonctionnalités

| Section | Détail |
|---------|--------|
| Dashboard | Nombre de clients, CA global, abonnements actifs/expirés |
| Boutiques | Lister, suspendre, réactiver, prolonger les abonnements |
| Utilisateurs | Voir tous les utilisateurs de toutes les boutiques |
| Synchronisations | Historique et état de la sync de chaque boutique |
| Notifications | Envoyer un message à un ou plusieurs clients |
| Sauvegardes | Voir et télécharger les sauvegardes de chaque boutique |
| Journal | Actions sensibles (suspensions, connexions admin, etc.) |

### Sécurité Super Admin

```typescript
// Guard NestJS
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // Vérifier que c'est bien un super admin (rôle séparé en BDD)
    return user?.role === 'super_admin';
  }
}
```

---

## Checklist de mise en production

### Avant le premier déploiement

- [ ] Créer le projet Supabase et exécuter le schéma SQL complet
- [ ] Activer Row Level Security sur toutes les tables
- [ ] Créer le projet Vercel et configurer les variables d'env frontend
- [ ] Déployer le backend sur Render et configurer les variables d'env
- [ ] Tester l'endpoint `GET /health` du backend → doit retourner `{ "status": "ok" }`
- [ ] Vérifier que CORS autorise correctement le domaine Vercel
- [ ] Générer un `JWT_SECRET` aléatoire fort : `openssl rand -hex 64`
- [ ] HTTPS actif sur tous les services (automatique Vercel + Render)
- [ ] Configurer les sauvegardes automatiques dans Supabase

### Sécurité

- [ ] `SUPABASE_SERVICE_KEY` uniquement côté backend, jamais dans le frontend
- [ ] `JWT_SECRET` long et unique — ne jamais le réutiliser
- [ ] Rate limiting activé sur `/auth/login` (max 10 tentatives / 15 min)
- [ ] Toutes les entrées validées côté backend avec `class-validator`
- [ ] Les passwords hashés avec `bcrypt` (coût ≥ 12)
- [ ] Logging des actions sensibles dans `journal_actions`

### Performance

- [ ] CDN Vercel Edge activé (automatique)
- [ ] Index PostgreSQL créés (inclus dans le schéma SQL ci-dessus)
- [ ] Compression gzip activée sur Render
- [ ] Cache HTTP sur les endpoints statiques (qualités, couleurs)
- [ ] Lazy loading des pages React (`React.lazy + Suspense`)

### Tests avant lancement

- [ ] Créer une boutique de test
- [ ] Créer un utilisateur Manager + un Caissier
- [ ] Tester une vente complète (sélection tissu → validation → reçu)
- [ ] Tester le mode hors ligne (couper le WiFi → faire une vente → reconnecter → vérifier sync)
- [ ] Vérifier les alertes de stock bas
- [ ] Tester l'expiration d'abonnement depuis le Super Admin

---

## Coûts estimés

### Plan minimal (1 boutique, démarrage)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Vercel | Hobby (Free) | 0 $ |
| Render | Starter | 7 $ |
| Supabase | Free (500 Mo, 2 projets) | 0 $ |
| **Total** | | **~7 $/mois** |

### Plan production (plusieurs boutiques)

| Service | Plan | Coût/mois |
|---------|------|-----------|
| Vercel | Pro | 20 $ |
| Render | Standard (2 CPU, 2 Go RAM) | 25 $ |
| Supabase | Pro (8 Go, backups) | 25 $ |
| **Total** | | **~70 $/mois** |

> Avec 10 boutiques abonnées à 15 000 FCFA/mois = **150 000 FCFA** de revenus pour ~46 000 FCFA de charges.

---

## Développement local

```bash
# 1. Cloner
git clone https://github.com/ton-compte/bazinpro.git
cd bazinpro

# 2. Installer
pnpm install

# 3. Configurer l'environnement
cp .env.example .env.local
# Remplir les valeurs dans .env.local

# 4. Lancer en mode développement
pnpm dev
# → http://localhost:5173

# 5. Build de production
pnpm build

# 6. Prévisualiser le build
pnpm preview
```

---

Développé par **Authentique Studio** — Bobo-Dioulasso, Burkina Faso
