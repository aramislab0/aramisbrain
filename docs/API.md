# ARAMIS BRAIN API Documentation

## Oracle APIs

### GET /api/oracle/trajectories

Generates 3 strategic trajectory options for the current week.

**Query Parameters:**

| Param   | Type    | Default | Description             |
|---------|---------|---------|-------------------------|
| refresh | boolean | false   | Force regeneration      |

**Response:**
```json
{
  "trajectories": [
    {
      "trajectory_number": 1,
      "title": "Concentration sur FLUZ",
      "context": "FLUZ montre bon momentum...",
      "what_it_means": "Si focus 70%...",
      "tradeoffs": "Autres projets ralentissent...",
      "timeline_estimate": "3 semaines si concentration maintenue",
      "focus_allocation": { "fluz": 70, "autres": 30 },
      "questions": ["..."],
      "tone": "opportunity",
      "confidence_note": null
    }
  ],
  "tone": "calm",
  "message": "Trajectoires cette semaine"
}
```

**Cache:** 5 minutes (`s-maxage=300`)

---

### GET /api/oracle/questions

Generates 1-3 strategic questions for CEO reflection.

**Query Parameters:**

| Param   | Type    | Default | Description             |
|---------|---------|---------|-------------------------|
| refresh | boolean | false   | Force regeneration      |

**Response:**
```json
{
  "questions": [
    {
      "question": "Quelle décision repousses-tu depuis 2 semaines ?",
      "context": "2 décisions pending sur WURUS",
      "why_now": "Clarté aide mouvement",
      "question_type": "decision"
    }
  ],
  "tone": "exploratory"
}
```

**Question Types:** `reflection` | `decision` | `priority` | `strategy`

---

### GET /api/oracle/summary

Generates weekly narrative summary.

**Query Parameters:**

| Param   | Type    | Default | Description             |
|---------|---------|---------|-------------------------|
| refresh | boolean | false   | Force regeneration      |

**Response:**
```json
{
  "summary": {
    "week_start_date": "2026-02-17",
    "week_end_date": "2026-02-23",
    "overview_narrative": "...",
    "what_advances": "...",
    "needs_attention": "...",
    "decisions_made": "...",
    "full_summary_markdown": "# Semaine du..."
  },
  "tone": "calm"
}
```

---

## Tone Guidelines

All Oracle API responses follow these rules:
- **No aggressive language** (`urgent`, `critique`, `alarme`, `danger`)
- **No judgmental framing** (`échec`, `désastre`)
- **Calm suggestions** using `possible`, `suggéré`, `considérer`
- **CEO agency preserved** — questions, never commands
