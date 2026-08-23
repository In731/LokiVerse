# LokiVerse

LokiVerse is an interactive, AI-powered web application that allows users to create, generate, and share Marvel-style multiversal character stories. With visually stunning 3D animations, AI prompt enhancement, and a built-in Text-to-Speech engine, LokiVerse provides a deeply immersive story-crafting experience.

## ✨ Features

- **Interactive 3D Carousel**: A dynamic GSAP-powered landing page featuring interactive viewing modes (Circle, Wave, Grid, Fan, Stagger, and Depth).
- **AI Story Generation**: Powered by the **Google Gemini 2.0 Flash API**. Users input their character's name, backstory, powers, and weaknesses, and the AI crafts a cinematic multiversal story.
- **Prompt Enhancement**: Built-in "Enhance Prompt" feature that uses AI to automatically improve user inputs for better storytelling results.
- **Immersive Visuals**: Features custom WebGL shaders and smooth text-stroke animations, creating a futuristic, multiverse aesthetic.
- **Text-to-Speech (TTS)**: Built-in narration capability allows users to listen to their generated stories with play, pause, and stop controls.
- **Story Management**: 
  - Save stories securely using **Firebase Firestore**.
  - Toggle story visibility between Public and Private.
  - Export stories directly to PDF.
- **Image Uploads**: Seamlessly upload character images using **Cloudinary**.
- **User Authentication**: Secure login and sign-up powered by **Firebase Authentication**.

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, CSS, Tailwind CSS.
- **Animations**: GSAP (GreenSock Animation Platform) + Draggable, InertiaPlugin, ScrollTrigger.
- **Backend / BaaS**: Firebase (Auth & Firestore).
- **AI Integration**: Google Gemini 2.0 Flash API.
- **Media Hosting**: Cloudinary.
- **Deployment**: Configured for Vercel with serverless functions for secure environment variable handling.

## 🚀 Getting Started

### Prerequisites

You will need accounts and API keys for the following services:
- Firebase (Auth, Firestore)
- Google Gemini API
- Cloudinary
- Formspree (for the contact form)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/LokiVerse.git
   cd LokiVerse
   ```

2. **Environment Variables Configuration:**
   If you are running this project locally, you will need to set up the environment variables. The project uses a Vercel serverless function (`api/config.js`) to securely pass keys to the frontend. Ensure your deployment environment (e.g., Vercel) has the following variables set:
   
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `GEMINI_API_KEY`
   - `CLOUDINARY_UPLOAD_PRESET`
   - `CLOUDINARY_CLOUD_NAME`
   - `FORMSPREE_ID`

3. **Running Locally:**
   Since the project relies on serverless API routes (`/api/config`), the easiest way to test it locally is to use the Vercel CLI:
   
   ```bash
   npm install -g vercel
   vercel dev
   ```
   This will start a local server that properly emulates the `/api` routing logic defined in `vercel.json`.

## 📁 Project Structure

- `index.html` & `js/index.js`: The landing page with the 3D GSAP carousel and public community stories.
- `login.html` & `js/login.js`: Authentication portal featuring immersive WebGL backgrounds.
- `main.html` & `js/main.js`: The core dashboard where users can generate, read, manage, and listen to AI stories.
- `api/config.js`: Serverless endpoint that serves configuration data without exposing sensitive keys in the client repository.
- `js/vendor/`: Contains third-party scripts (e.g., GSAP plugins).
