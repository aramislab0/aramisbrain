# 🚀 Configuration Rapide — 3 Commandes

## Option 1: Configuration Guidée Automatique (Recommandé)

```bash
# Étape 1: Lancez le wizard interactif
./scripts/setup.sh

# Étape 2: Appliquez les migrations SQL
# → Ouvrez https://app.supabase.com/project/YOUR_PROJECT/sql
# → Copiez/collez le contenu de supabase/migrations/20260217_init_schema.sql
# → Cliquez "Run"

# Étape 3: Redémarrez le serveur
npm run dev

# Étape 4: Validez que tout fonctionne
./scripts/validate.sh
```

**Temps total : ~5 minutes**

---

## Option 2: Configuration Manuelle

### 1. Créer .env.local

```bash
cp .env.local.example .env.local
nano .env.local  # ou code .env.local
```

Remplir les valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Migrations SQL

1. Ouvrir Supabase SQL Editor
2. Copier `supabase/migrations/20260217_init_schema.sql`
3. Exécuter

### 3. Redémarrer

```bash
npm run dev
```

### 4. Valider

```bash
./scripts/validate.sh
```

---

## Checklist Post-Installation

Après configuration, testez manuellement :

- [ ] **Cockpit** : http://localhost:3000/dashboard → 6 projets visibles
- [ ] **Focus** : http://localhost:3000/focus → Formulaire éditable + auto-save
- [ ] **Radar** : http://localhost:3000/risks → Chart.js visible
- [ ] **Chat IA** : http://localhost:3000/ai-chat → Réponse contextuelle

---

## Troubleshooting Rapide

### Erreur "Failed to fetch"
```bash
# Vérifier credentials
cat .env.local | grep SUPABASE_URL

# Redémarrer
npm run dev
```

### Table "projects" n'existe pas
```bash
# Re-exécuter migrations SQL dans Supabase Editor
```

### API Key invalide (OpenAI/Anthropic)
```bash
# Vérifier format dans .env.local
# OpenAI doit commencer par sk-
# Anthropic doit commencer par sk-ant-
```

---

## Scripts Disponibles

```bash
./scripts/setup.sh      # Configuration wizard interactif
./scripts/validate.sh   # Tests automatiques
```

---

## Support

- 📖 **Guide complet** : `walkthrough.md`
- 🐛 **Troubleshooting** : `walkthrough.md` section "🚨 TROUBLESHOOTING"
- 💬 **Migrations SQL** : `supabase/migrations/20260217_init_schema.sql`
