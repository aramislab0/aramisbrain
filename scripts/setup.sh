#!/bin/bash

# 🎯 ARAMIS BRAIN v0.1 - Configuration Wizard
# Ce script guide la configuration pas-à-pas

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🧠 ARAMIS BRAIN v0.1 - Configuration Wizard            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de validation
validate_url() {
    if [[ $1 =~ ^https:\/\/.+\.supabase\.co$ ]]; then
        return 0
    else
        return 1
    fi
}

# Étape 1: Bienvenue
echo -e "${BLUE}📋 Ce script va vous guider pour configurer ARAMIS BRAIN${NC}"
echo ""
echo "Vous aurez besoin de :"
echo "  1️⃣  Credentials Supabase (URL + Anon Key)"
echo "  2️⃣  OpenAI API Key (optionnel pour GPT-4)"
echo "  3️⃣  Anthropic API Key (optionnel pour Claude)"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

# Étape 2: Supabase URL
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}1️⃣  SUPABASE PROJECT URL${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Où trouver : https://app.supabase.com/project/YOUR_PROJECT/settings/api"
echo "   Format     : https://xxx.supabase.co"
echo ""

while true; do
    read -p "Supabase URL: " SUPABASE_URL
    if validate_url "$SUPABASE_URL"; then
        echo -e "${GREEN}✅ URL valide${NC}"
        break
    else
        echo -e "${RED}❌ Format invalide. Doit être https://xxx.supabase.co${NC}"
    fi
done

# Étape 3: Supabase Anon Key
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}2️⃣  SUPABASE ANON KEY${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Où trouver : Même page, section 'anon/public'"
echo "   Format     : eyJhbGciOiJIUzI1NiIsInR5cCI6..."
echo ""
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

if [[ $SUPABASE_ANON_KEY == eyJ* ]]; then
    echo -e "${GREEN}✅ Key valide${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: La clé ne commence pas par 'eyJ' (peut être valide quand même)${NC}"
fi

# Étape 4: OpenAI (optionnel)
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}3️⃣  OPENAI API KEY (optionnel)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Où trouver : https://platform.openai.com/api-keys"
echo "   Format     : sk-..."
echo "   Note       : Requis uniquement pour GPT-4"
echo ""
read -p "OpenAI API Key (laissez vide pour skip): " OPENAI_KEY

# Étape 5: Anthropic (optionnel)
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}4️⃣  ANTHROPIC API KEY (optionnel)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Où trouver : https://console.anthropic.com/settings/keys"
echo "   Format     : sk-ant-..."
echo "   Note       : Requis uniquement pour Claude"
echo ""
read -p "Anthropic API Key (laissez vide pour skip): " ANTHROPIC_KEY

# Étape 6: Génération .env.local
echo ""
echo -e "${BLUE}📝 Génération du fichier .env.local...${NC}"

cat > .env.local << EOF
# ══════════════════════════════════════════════════════════
# 🧠 ARAMIS BRAIN v0.1 - Environment Variables
# ══════════════════════════════════════════════════════════
# Généré le : $(date)
# ══════════════════════════════════════════════════════════

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# OpenAI API (Optional - for GPT-4)
OPENAI_API_KEY=${OPENAI_KEY:-sk-YOUR_OPENAI_KEY_HERE}

# Anthropic API (Optional - for Claude)
ANTHROPIC_API_KEY=${ANTHROPIC_KEY:-sk-ant-YOUR_ANTHROPIC_KEY_HERE}

# ══════════════════════════════════════════════════════════
# 📖 Next Steps:
# 1. Exécuter migrations SQL (voir scripts/run-migration.sh)
# 2. Redémarrer le serveur: npm run dev
# 3. Ouvrir http://localhost:3000
# ══════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✅ Fichier .env.local créé avec succès !${NC}"
echo ""

# Étape 7: Prochaines étapes
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🎯 PROCHAINES ÉTAPES${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1️⃣  Appliquer les migrations SQL :"
echo "   ${BLUE}→ Ouvrir Supabase SQL Editor${NC}"
echo "   ${BLUE}→ Copier le contenu de supabase/migrations/20260217_init_schema.sql${NC}"
echo "   ${BLUE}→ Exécuter dans l'éditeur${NC}"
echo ""
echo "2️⃣  Redémarrer le serveur :"
echo "   ${BLUE}→ Ctrl+C pour arrêter${NC}"
echo "   ${BLUE}→ npm run dev${NC}"
echo ""
echo "3️⃣  Tester l'application :"
echo "   ${BLUE}→ http://localhost:3000/dashboard${NC}"
echo ""

# Proposition d'ouvrir le SQL Editor
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
read -p "Voulez-vous ouvrir le Supabase SQL Editor maintenant ? (y/n): " open_editor

if [[ $open_editor == "y" || $open_editor == "Y" ]]; then
    # Extraire le project ID de l'URL
    PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')
    SQL_EDITOR_URL="https://app.supabase.com/project/$PROJECT_ID/sql"
    
    echo ""
    echo -e "${GREEN}🌐 Ouverture du SQL Editor...${NC}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$SQL_EDITOR_URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$SQL_EDITOR_URL"
    else
        echo "   URL: $SQL_EDITOR_URL"
    fi
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Configuration terminée !                             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
