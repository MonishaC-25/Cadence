# Cadence — Enterprise Meeting Intelligence & Task Governance

Cadence is an intelligent meeting workspace that captures audio recordings, transcribes discussions with multi-speaker diarization across languages (French, Korean, Japanese, English, etc.), and automatically extracts high-leverage deliverables with assignees and deadlines. It bridges raw conversations directly into execution through an interactive Kanban board, real-time payroll cost tracking, vocal biometrics training, offboarding management, and instant email dispatches.

*"Turn Talk Into Relentless Execution."*

---

## 🚀 How to Deploy This to GitHub & Vercel

### Step 1: Create a New GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Choose a repository name (e.g. `cadence-meeting-intelligence`).
3. Set the repository to **Public** or **Private**.
4. Leave "Add a README file", ".gitignore", and "license" **unchecked** (we already have them configured).
5. Click **Create repository**.

---

### Step 2: Push Your Code from Your Local Terminal

If you haven't initialized git yet:
```bash
git init
git add .
git commit -m "feat: initial commit of Cadence workspace"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cadence-meeting-intelligence.git
git push -u origin main
```

If you already have a git repo connected:
```bash
git add .
git commit -m "feat: update vocal biometrics, offboarding flow, and maximized meeting dialog"
git push origin main
```

---

### Step 3: Deploy to Vercel (1-Click Continuous Deployment)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New..."** > **"Project"**.
3. Select your newly created `cadence-meeting-intelligence` repository and click **Import**.
4. Configure Project Settings:
   - **Framework Preset**: `Vite` (Vercel automatically detects this).
   - **Root Directory**: `./` (Default).
   - **Build Command**: `vite build` (or `npm run build`).
   - **Output Directory**: `dist`.
   - **Install Command**: `npm install --legacy-peer-deps` (Already configured in `vercel.json`).
5. **Environment Variables**:
   Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API Key from aistudio.google.com)*
6. Click **Deploy**.

Vercel will build the project and assign a production URL (e.g. `https://cadence-meeting-intelligence.vercel.app`).

---

## 🛠 Local Development Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/cadence-meeting-intelligence.git
   cd cadence-meeting-intelligence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY into .env.local
   ```

4. **Run the local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📦 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Web Audio API
- **AI & Diarization**: `@google/genai` (Gemini 2.5 Flash / Flash Lite)
- **Deployment**: Vite 8, Vercel Serverless Functions (`/api/*`), Cloud Run
