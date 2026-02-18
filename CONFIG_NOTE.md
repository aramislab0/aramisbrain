# ⚠️ IMPORTANT: Vérification Clé Supabase

## 🔍 Statut Configuration

✅ `.env.local` créé avec:
- URL Supabase: `https://zeytfwfllcbpgenxuvnl.supabase.co`
- Clé fournie: `sb_publishable_Svhe0CCRbp5NSuzVC4Bi8g_WbcDTKVj`

## ⚠️ Possible Problème de Clé

La clé fournie (`sb_publishable_...`) ne ressemble **pas** à une clé Supabase standard.

### Format Attendu

Les clés Supabase "anon" (publiques) commencent généralement par `eyJ...` (format JWT).

Exemple:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
```

### Votre Clé

```
sb_publishable_Svhe0CCRbp5NSuzVC4Bi8g_WbcDTKVj
```

**Format**: Non-standard pour Supabase traditionnel.

---

## 🎯 Action Recommandée

### Option 1: Vérifier la clé actuelle

Tester si la clé fonctionne malgré le format inhabituel:

```bash
# Redémarrer le serveur
npm run dev

# Puis tester
curl http://localhost:3000/api/decisions
```

Si ça fonctionne → **Parfait, pas de changement nécessaire!**

---

### Option 2: Récupérer la vraie clé ANON

Si la clé actuelle ne fonctionne pas:

1. **Aller sur Supabase Dashboard**:  
   https://supabase.com/dashboard/project/zeytfwfllcbpgenxuvnl

2. **Naviguer**: Settings → API

3. **Copier**: "Project API keys" → **`anon` `public`** (la longue clé JWT)

4. **Remplacer dans `.env.local`**:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (la vraie clé JWT)
   ```

---

## 📊 Prochaines Étapes

1. **Redémarrer serveur** (obligatoire après `.env.local`):
   ```bash
   # Ctrl+C puis:
   npm run dev
   ```

2. **Tester connexion**:
   ```bash
   curl http://localhost:3000/api/decisions
   ```

3. **Résultat attendu**:
   - ✅ Si JSON avec `{"decisions": [], "total": 0}` → **Connexion OK**
   - ❌ Si erreur `supabaseUrl is required` → Clé incorrecte

---

## 🗄️ Migrations SQL

**Une fois la connexion validée**, appliquer les migrations:

1. Ouvrir Supabase SQL Editor:  
   https://supabase.com/dashboard/project/zeytfwfllcbpgenxuvnl/sql

2. Copier le contenu de:  
   `supabase/migrations/20260217_init_schema.sql`

3. Coller et **RUN** dans SQL Editor

4. Vérifier la création des 7 tables

---

**Créé le**: 17 février 2026, 23:41 UTC  
**Statut**: ⏳ En attente de redémarrage serveur
