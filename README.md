# 🌌 FusionNotes

Welcome to **FusionNotes**! We didn't just build another note-taking app—we built an aesthetic, AI-powered collaborative study powerhouse. FusionNotes combines an ultra-smooth, dark-themed UI with a robust FastAPI backend, Supabase for scalable database & authentication, and Google's Gemini AI for flawless OCR and note synthesis.

## ✨ Core Features & The Sauce

### 🤖 Collaborative AI Synthesis & OCR
- **Gemini-Powered OCR:** Upload photos of your handwritten notes or PDFs to any subject, and Gemini 2.5 Flash automatically extracts and formats the text into clean Markdown.
- **Group Knowledge Synthesis:** When multiple students upload notes to the same subject (e.g., Biology), anyone can hit **"✧ Synthesize Guide"**. Gemini cross-references every single note in the database for that subject, fills in the gaps, and instantly generates a master study guide.
- **Rich Rendering:** Synthesized guides support mathematical LaTeX formulas (KaTeX), markdown tables, and even automatically generate Mermaid flowcharts to visualize complex structures.

### 🔒 Secure Backend Architecture
- **Supabase Authentication:** Secure, JWT-based user registration and login flow.
- **Row-Level Bypassing:** The FastAPI backend securely manages database writes using a dedicated Supabase Admin client, ensuring safe, centralized AI synthesis without exposing permissions to the client.
- **FastAPI Core:** A lightning-fast API layer handling all cross-origin requests, file uploads, and AI prompt orchestration.

### 🎨 High-End UI/UX
- **Monochrome Mastery & High-Res Glassmorphism:** Sleek, high-contrast black-and-white design system built on translucent, ultra-blurred glass panels.
- **Hyprland Physics:** Every button pop, hover effect, floating panel, and overlay entrance uses an over-damped spring animation so it feels bouncy, snappy, and alive.
- **Subject-First Organization:** Notes are strictly organized by subjects with dedicated context bars, sort controls (Newest, A-Z), and scoped search.

## 🛠️ Tech Stack & Environment

**Frontend:**
- **React 18** + **Vite** + **TypeScript**
- **react-markdown** / **rehype-katex** / **mermaid** (For rich Master Guide rendering)
- **Lucide React** (Icons)

**Backend:**
- **FastAPI** (Python web framework)
- **Supabase** (PostgreSQL Database + Auth + Storage)
- **Google GenAI SDK** (Gemini 2.5 Flash)

## 🚀 Running Locally

### 1. Backend Setup
Navigate to the `hack` directory and set up your Python environment:
```bash
cd hack
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```
Make sure you have a `.env` file in the `hack` directory with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```
Start the backend server:
```bash
uvicorn main:app --reload --port 3000
```

### 2. Frontend Setup
Open a new terminal, navigate to the `app` directory:
```bash
cd app
npm install
npm run dev
```
The frontend will start on port `5173` and automatically proxy `/api` requests to the backend on port `3000`.

---
*Built with ❤️ for collaborative studying.*