# FusionNotes

<p align="center">
  <img src="app/public/darklogo.png" width="180" alt="FusionNotes Logo" />
</p>

### The AI-Powered Collaborative Study Suite

FusionNotes is a next-generation, aesthetic Progressive Web App (PWA) designed to synchronize fragmented study materials into unified, AI-synthesized master guides. We built it with a focus on high-end user experience and robust real-time collaboration.

---

## Table of Contents

- [Innovation](#innovation)
- [Technical Implementation](#technical-implementation)
- [Feasibility and Scalability](#feasibility-and-scalability)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)

---

## Innovation

Our Gemini-powered synthesis goes beyond simple OCR. FusionNotes uses Google Gemini (1.5 Pro) to synthesize heterogeneous inputs — handwritten notes, textbook snippets, and flowcharts — into a coherent Master Study Guide. The system also features multi-modal intelligence that automatically detects and renders LaTeX equations and Mermaid.js diagrams from simple image uploads or text snippets. We also designed an aesthetic, high-utility interface inspired by high-end Linux customizations, featuring 16px blur glassmorphism and over-damped spring animations for a snappy, premium feel.

---

## Technical Implementation

We built a high-performance FastAPI backend designed for low-latency AI processing. For collaboration, we use Supabase (Postgres/RLS) to power instant multi-user synchronization, activity streams, and live profile tracking. FusionNotes is also a fully offline-capable Progressive Web App with service worker caching and cross-device responsiveness. On top of that, we implemented custom OCR logic to handle tables and flowcharts, ensuring parity between raw study data and the final synthesized output.

---

## Feasibility and Scalability

We leveraged Supabase for infinite horizontal scaling and Google's GenAI for efficient, high-volume data distillation, giving FusionNotes an enterprise-grade backbone. The application directly addresses the problem of fragmented knowledge in student groups, merging separate study habits into a single, high-fidelity knowledge base. We have fully purged the system of mock data, with live user synchronization in place, making it ready for immediate campus deployment.

---

## Core Features

- **Live Collaborators** — Track your study group's activity and status in real time.
- **Multilingual Support** — Fully localized in English, Hindi, Malayalam, Tamil, and Telugu.
- **Keyboard-Driven Study** — Navigate flashcards and search with optimized shortcut keys.
- **Glassmorphism UI** — Premium visual experience with custom-designed abstract backdrops.

---

## Tech Stack

All libraries and frameworks used in FusionNotes are open-source and entirely free to use, with no paid licenses or proprietary dependencies.

| Library / Framework | Category | License |
|---|---|---|
| React 19 | Frontend UI Framework | Open-Source (MIT) |
| Vite | Frontend Build Tool | Open-Source (MIT) |
| TypeScript | Programming Language | Open-Source (Apache 2.0) |
| Lucide Icons | Icon Library | Open-Source (ISC) |
| i18next | Internationalization | Open-Source (MIT) |
| FastAPI | Backend Web Framework | Open-Source (MIT) |
| Python 3.11+ | Backend Language | Open-Source (PSF) |
| Google GenAI SDK | AI Integration Library | Open-Source (Apache 2.0) |
| Supabase Client | Database / Auth Client | Open-Source (MIT) |
| PostgreSQL | Relational Database | Open-Source (PostgreSQL License) |
| Mermaid.js | Diagram Rendering | Open-Source (MIT) |
| Rehype-KaTeX | LaTeX Math Rendering | Open-Source (MIT) |
| React-Markdown | Markdown Rendering | Open-Source (MIT) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project
- A Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/fusionnotes.git
   cd fusionnotes
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   # Frontend (.env)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Backend (.env)
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

5. **Run the development servers**
   ```bash
   # Frontend
   npm run dev

   # Backend
   uvicorn main:app --reload
   ```

---

*Created with care for students who value both aesthetics and efficiency.*