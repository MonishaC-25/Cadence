# Cadence — Enterprise Meeting Intelligence & Task Execution

> *Turn talk into traction.*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

---

## 🌐 Live Application URL
- **Production / Deployed URL**: `https://YOUR_DEPLOYED_URL_HERE` *(Replace with your Vercel/Render/Railway URL)*
- **AI Studio Dev Preview**: Hosted in Google AI Studio

---

## ✨ Features

- **Autonomous Meeting Transcripts & Diarization**: Multi-speaker labeling with synchronized timestamp jumping.
- **Advanced Ask Cadence Knowledge Engine**: Query across all meetings or target a specific session with decision, deliverable, and risk templates.
- **Enterprise Opening Portal & Persona Switcher**: Google Workspace OAuth, SSO simulation, and 1-click employee perspective switching.
- **Interactive Action Items & Kanban Board**: Manage tasks, deadlines, owners, and download `.ics` calendar invites.
- **Notification Bell with Audio Synthesizer**: Pure Web Audio chime on task assignment and simulated email relay dispatches.
- **Meeting Payroll Cost & ROI Calculator**: Tracks exact financial cost per session based on employee rates and output deliverables.
- **Executive PDF Export & Markdown Recaps**: Clean downloadable reports for Notion, Jira, or Slack.

---

## 🚀 Step-by-Step GitHub Setup

### 1. Initialize Git & Push to GitHub
```bash
# Initialize git repository (if not already done)
git init

# Add all project files
git add .

# Create initial commit
git commit -m "feat: Cadence meeting intelligence and task execution platform"

# Set default branch
git branch -M main

# Link to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# Push to GitHub
git push -u origin main
```

---

## ☁️ Deployment Platforms & Hosting

Cadence has a full-stack architecture (**React 19 + Express API**). Here are the recommended deployment options:

### Option 1: Render (Recommended for full-stack Node/Express + React)
1. Go to [Render.com](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variable:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key)*
5. Click **Deploy Web Service**.

### Option 2: Railway
1. Go to [Railway.app](https://railway.app) and select **New Project** → **Deploy from GitHub repo**.
2. Set Environment Variable:
   - `GEMINI_API_KEY`: *(Your key)*
3. Railway automatically detects `npm run build` and `npm start`.

### Option 3: Vercel
1. Import repository on [Vercel.com](https://vercel.com).
2. Framework Preset: **Vite**.
3. Add `GEMINI_API_KEY` under Project Settings → Environment Variables.

---

## 📌 How to Keep Your Deployment Link Safe on GitHub
1. **GitHub Repository Header**:
   - Go to your repository page on GitHub.
   - Click the **⚙️ (Gear icon)** next to "About" on the top right.
   - Enter your live link in the **Website** field and check **Use your GitHub Pages website** or paste your custom deployed URL.
2. **README.md Top Section**:
   - Keep your live link in the **🌐 Live Application URL** section at the top of this `README.md`.
3. **GitHub Environments**:
   - In GitHub Settings → Environments, create an environment named `Production` and paste the URL.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server on port 3000
npm run dev
```

---

## 📄 License
Apache-2.0

