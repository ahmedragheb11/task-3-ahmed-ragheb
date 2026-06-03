# Task 3 — The Knowledge Analyst (RAG Concepts)

> DecodeLabs Industrial Training | Batch 2026 | Generative AI Track

---

## Overview

This project simulates a **Retrieval-Augmented Generation (RAG)** workflow for document intelligence. It solves a real-world problem: a law firm has 500-page contracts that take hours to read. This tool lets you upload any document and instantly extract key information — with AI answers that cite specific sections.

---

## What It Does

- **Upload any document** — paste text or upload `.txt`, `.md`, `.csv`, or `.json` files
- **Auto-extracts** Risks, Dates, Stakeholders, and Key Clauses into a visual dashboard
- **Q&A with citations** — ask any question about the document and the AI answers using only the document content, citing the relevant section
- **Executive summary** — generates a 2–3 sentence summary of the entire document

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JSX) |
| AI Model | Claude Sonnet (Anthropic API) |
| Prompt technique | Few-shot + citation-forcing prompts |
| Deployment | Claude.ai Artifact |

---

## How It Works (RAG Concept)

Traditional AI answers from general training data and can hallucinate. This tool simulates RAG by:

1. **Ingesting** the user's document as context in every API call
2. **Forcing citations** — the system prompt instructs the model to reference only the provided document and cite specific sections for every answer
3. **Structured extraction** — prompts are engineered to return JSON with predefined fields (risks, dates, stakeholders, clauses), preventing freeform hallucination

```
User Document → Prompt Engineering → Claude API → Structured JSON → Dashboard UI
```

---

## Prompt Engineering Highlights

The extraction prompt forces structured, grounded output:

```
You are a legal document analyst. Analyze this document and extract key information.
Return ONLY a valid JSON object:
{
  "risks": ["list of risk items, each as a short phrase"],
  "dates": ["list of important dates/deadlines"],
  "stakeholders": ["list of parties/entities mentioned"],
  "keyClauses": ["list of 3-5 important clause summaries"],
  "summary": "2-3 sentence executive summary"
}
```

The Q&A prompt enforces citation behavior:

```
Answer the question based ONLY on the document provided.
Cite specific sections or line numbers when possible.
If the answer is not in the document, say so clearly.
```

---

## Screenshots

> *(Add screenshots of your dashboard here after testing)*

---

## Live Demo

> *(Add your Claude artifact link or deployment link here)*

---

## How to Run Locally

This project runs as a React artifact on Claude.ai. To run locally:

```bash
git clone https://github.com/YOUR_USERNAME/decodelabs-genai
cd task-3
npm install
npm run dev
```

Add your Anthropic API key to a `.env` file:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

---

## Key Learnings

- How RAG differs from standard LLM inference (grounding vs. hallucination)
- Prompt engineering for structured JSON output
- Citation-forcing techniques to improve answer reliability
- Building document intelligence tools with a real AI API

---

*Built as part of the DecodeLabs Generative AI Internship — Batch 2026*
