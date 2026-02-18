#!/bin/bash

# 🧪 ARAMIS BRAIN v0.1 - Validation Script
# Teste que tous les modules fonctionnent correctement

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🧪 ARAMIS BRAIN - Tests de Validation                  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Fonction de test HTTP
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "  Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
        return 1
    fi
}

# Vérifier que le serveur tourne
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}0️⃣  Vérification Serveur${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if curl -s "$BASE_URL" > /dev/null; then
    echo -e "  ${GREEN}✅ Serveur accessible sur $BASE_URL${NC}"
else
    echo -e "  ${RED}❌ Serveur non accessible ! Lancez 'npm run dev' d'abord${NC}"
    exit 1
fi

echo ""

# Test 1: Pages principales
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}1️⃣  Pages Principales${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

test_endpoint "Homepage" "$BASE_URL"
test_endpoint "Cockpit Global" "$BASE_URL/dashboard"
test_endpoint "Focus du Jour" "$BASE_URL/focus"
test_endpoint "Radar de Risques" "$BASE_URL/risks"
test_endpoint "Dialogue IA" "$BASE_URL/ai-chat"

echo ""

# Test 2: API Routes
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}2️⃣  API Routes${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "  Testing Projects API... "
response=$(curl -s "$BASE_URL/api/projects/cockpit")
if echo "$response" | grep -q "projects"; then
    echo -e "${GREEN}✅ PASS${NC} (data returned)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (no data or error)"
    echo "     Response: $response" | head -c 100
    ((FAILED++))
fi

echo -n "  Testing Focus API... "
response=$(curl -s "$BASE_URL/api/focus/today")
if echo "$response" | grep -q "focus"; then
    echo -e "${GREEN}✅ PASS${NC} (data returned)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (no data or error)"
    ((FAILED++))
fi

echo -n "  Testing Risks API... "
response=$(curl -s "$BASE_URL/api/risks/radar")
if echo "$response" | grep -q "radar"; then
    echo -e "${GREEN}✅ PASS${NC} (data returned)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (no data or error)"
    ((FAILED++))
fi

echo ""

# Test 3: Validation Supabase
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}3️⃣  Configuration Supabase${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -f ".env.local" ]; then
    echo -e "  ${GREEN}✅ Fichier .env.local existe${NC}"
    ((PASSED++))
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local; then
        echo -e "  ${GREEN}✅ SUPABASE_URL configuré${NC}"
        ((PASSED++))
    else
        echo -e "  ${RED}❌ SUPABASE_URL manquant ou invalide${NC}"
        ((FAILED++))
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local; then
        echo -e "  ${GREEN}✅ SUPABASE_ANON_KEY configuré${NC}"
        ((PASSED++))
    else
        echo -e "  ${RED}❌ SUPABASE_ANON_KEY manquant ou invalide${NC}"
        ((FAILED++))
    fi
else
    echo -e "  ${RED}❌ Fichier .env.local manquant${NC}"
    echo -e "     ${YELLOW}→ Lancez ./scripts/setup.sh pour le créer${NC}"
    ((FAILED+=3))
fi

echo ""

# Résumé
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 RÉSUMÉ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Tests réussis : ${GREEN}$PASSED ✅${NC}"
echo "  Tests échoués : ${RED}$FAILED ❌${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 TOUS LES TESTS SONT PASSÉS !                        ║${NC}"
    echo -e "${GREEN}║  ARAMIS BRAIN est prêt à l'emploi                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠️  CERTAINS TESTS ONT ÉCHOUÉ                          ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Prochaines actions :${NC}"
    echo "  1. Vérifier .env.local avec ./scripts/setup.sh"
    echo "  2. Appliquer migrations SQL"
    echo "  3. Redémarrer le serveur : npm run dev"
    echo ""
    exit 1
fi
