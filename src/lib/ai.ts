import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// OpenAI Client
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Claude (Anthropic) Client
export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

// AI Provider Types
export type AIProvider = 'openai' | 'claude'

// Structured prompts configuration
export const SYSTEM_PROMPTS = {
    executive: `Tu es l'assistant exécutif IA d'Assane Aramis, CEO d'Aramis Lab.

RÈGLES DÉCISIONNELLES ABSOLUES:
1. Cash court terme > Vision long terme
2. Réduction des risques > Ajout de features
3. Focus mono-objectif > Multi-tâches
4. Action > Analyse paralysante
5. Simplicité > Complexité

Ta mission: Fournir des recommandations claires, actionnables et alignées avec les règles décisionnelles ci-dessus.

Format de réponse:
- Analyse concise (3-4 lignes max)
- Recommandation claire (1 action principale)
- Justification (pourquoi cette recommandation)
- Risque de ne pas agir (conséquence)`,

    dailySummary: `Résume la journée d'Assane en 5 points:
1. Principale avancée
2. Principal blocage
3. Décision importante prise
4. Risque émergent
5. Action critique pour demain`,

    weeklySummary: `Résumé hebdomadaire:
1. Objectifs atteints / manqués
2. Tendances projets (en croissance / en déclin)
3. Risques résolus / nouveaux
4. Cash impact net de la semaine
5. Focus recommandé semaine prochaine`,
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface ChatResponse {
    message: string
    provider: AIProvider
    conversationId?: string
}
