# 🧠 ARAMIS BRAIN v0.2

**Centre de Commandement Exécutif** pour Assane Aramis — Aramis Lab

---

## 🚀 Quick Start

```bash
# 1. Installation
npm install

# 2. Configuration (wizard interactif)
./scripts/setup.sh

# 3. Migrations SQL
# → Ouvrir Supabase SQL Editor
# → Exécuter supabase/migrations/20260217_init_schema.sql

# 4. Lancer
npm run dev

# 5. Valider
./scripts/validate.sh
```

**Voir [SETUP.md](./SETUP.md) pour le guide détaillé.**

---

## 📊 Modules Disponibles

### 1. Cockpit Global (`/dashboard`)
Vue d'ensemble temps réel de tous les projets actifs avec métriques clés.

### 2. Focus du Jour (`/focus`)
Définition des 3 priorités quotidiennes avec auto-save automatique.

### 3. Radar de Risques (`/risks`)
Visualisation radar multi-dimensionnelle des risques actifs.

### 4. Dialogue IA Executive (`/ai-chat`)
Assistant stratégique contextuel (GPT-4 / Claude Sonnet 4).

### 5. ORACLE (`/oracle`) ✨ **NEW v0.2**
Assistant stratégique calme — trajectoires, questions, résumé hebdomadaire.

> *Clarté sans pression. Discipline sans jugement. Liberté intacte.*

- **3 trajectoires** stratégiques hebdomadaires (concentration, équilibre, déblocage)
- **Questions non-directives** contextualisées pour réflexion CEO
- **Résumé narratif** hebdomadaire de tous les projets
- Design Silent Command (noir + gold, aucun rouge/alerte)

---

## 🏗️ Architecture

- **Framework** : Next.js 16.1.6 (App Router)
- **Database** : Supabase PostgreSQL
- **AI** : OpenAI GPT-4 + Anthropic Claude
- **Styling** : Tailwind CSS v4
- **Data** : React Query (@tanstack/react-query)
- **Charts** : Chart.js (react-chartjs-2)

---

## 📁 Structure

```
aramis-brain/
├── src/
│   ├── app/
│   │   ├── api/          # API Routes (7 endpoints)
│   │   ├── dashboard/    # Module 1: Cockpit
│   │   ├── focus/        # Module 2: Focus du Jour
│   │   ├── risks/        # Module 3: Radar Risques
│   │   ├── ai-chat/      # Module 4: Dialogue IA
│   │   └── oracle/       # Module 5: ORACLE v0.2
│   ├── components/       # React Components
│   └── lib/
│       ├── oracle/       # Oracle logic (trajectories, questions, summary)
│       └── supabase.ts   # Supabase client
├── supabase/
│   └── migrations/       # SQL Schema + Seed Data
├── docs/
│   └── API.md            # API documentation
└── scripts/
    ├── setup.sh          # Configuration wizard
    └── validate.sh       # Tests automatiques
```

---

## 🎨 Design System

**Silent Command Aesthetic**
- Dark graphite backgrounds (#0F0F0F, #1A1A1A)
- Gold Aramis accents (#D4AF37)
- Risk color coding (green → red)
- Inter font family

---

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** — Guide configuration rapide
- **[walkthrough.md](./.gemini/antigravity/brain/.../walkthrough.md)** — Détails implémentation

---

## 🧪 Tests

```bash
# Validation automatique
./scripts/validate.sh

# Tests manuels
# → http://localhost:3000/dashboard
# → http://localhost:3000/focus
# → http://localhost:3000/risks
# → http://localhost:3000/ai-chat
```

---

## 📦 Scripts NPM

```bash
npm run dev      # Serveur développement (localhost:3000)
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # ESLint
npm test         # Unit tests (Vitest)
npm run test:integration  # API integration tests
```

---

## 🔐 Variables d'Environnement

Fichier `.env.local` requis (généré par `./scripts/setup.sh`) :

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...              # Optionnel (GPT-4)
ANTHROPIC_API_KEY=...           # Optionnel (Claude)
```

---

## 🐛 Troubleshooting

Voir [SETUP.md](./SETUP.md) section "Troubleshooting Rapide"

---

## 👨‍💻 Développeur

**Assane Aramis** — CEO Aramis Lab  
**Agent** : Claude (Antigravity IDE)  
**Version** : v0.2 (ORACLE)

---

## 📄 License

Propriétaire — Aramis Lab © 2026
