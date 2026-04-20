<div align="center">
  <h1>🎨 Disease Prediction Interface</h1>
  <p><strong>A Sleek, Interactive Agronomy Companion Application</strong></p>

  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](#)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](#)
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](#)
</div>

## 📌 Overview

The frontend interface for the Disease Prediction ecosystem. Built with raw performance in mind via **Vite** and styled interactively with React and standard CSS. This SPA acts as the entrypoint for users wishing to upload leaf imagery, rendering AI-generated diagnostic streams gracefully.

### ✨ Features
- **Rapid HMR:** Scaffolded flawlessly with `Vite` for lightning-fast module reloading.
- **Interactive Component Mapping:** Easily visualize AI responses, meteorological charts, and complex treatment taxonomies fetched from our ReAct agent.

## 🛠️ Setup & Running Locally

1. Install NPM Dependencies:
```bash
npm install
```

2. Run the Vite Dev Server:
```bash
npm run dev
```
*(The UI will default launch on `http://localhost:3000` assuming the `vite.config.ts` mapping).*

## 🐳 Docker Production Build

Rather than deploying the raw development server, our included Dockerfile compiles your React code using the `tsc -b && vite build` pattern via multi-stage construction before copying the minified `/dist` block over onto a rapid **Nginx Alpine** engine. 

```bash
docker build -t frontend:latest .
docker run -p 80:80 frontend:latest
```
*Note: Make sure your proxy routes or CNAME aliases translate HTTP queries back to the Express Node app correctly in a production environment.*

---
*Built by [@Sathvik33](https://github.com/Sathvik33) as part of the Disease-Prediction Platform.*
