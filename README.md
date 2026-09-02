# 🌍 WorldDex: Where Would You Be Born?

> **"Unlock the world, one birth at a time."**

**WorldDex** is an interactive *gacha/roulette-style* game that answers a fascinating question: *"If you were born right now, where in the world would it be?"*

Based on real demographic data and global birth rate estimates, the game simulates the exact probability of you being born in every country. Countries like India or Nigeria drop very frequently (**Common** rarity), whereas places like the Vatican, Iceland, or Cape Verde are incredibly rare (**Legendary**).

---

## ✨ Main Features (How It Works)

- 🎲 **Demographic Roulette**: When you click "Roll", the drop rate for a country perfectly matches the real-world probability of being born there.
- 🗺️ **Interactive Map**: Every country you unlock paints your global passport on an interactive 2D/3D map.
- 🏆 **Global Achievements**: Complete continental blocks, geopolitical organizations (PALOP, EU, NATO, BRICS), and earn explorer titles.
- 🛒 **Shop & Upgrades**: Duplicate countries reward you with "Duplicate Coins". Use them to buy Luck upgrades, the highly coveted Autoclicker, and multipliers.
- 🌍 **Multilingual**: Massive support for **50+ languages**, including detailed manual translations for **Cape Verdean Creole**, **Kimbundu**, **Umbundu**, and **Kikongo**.
- 🛡️ **Pity System**: Having terrible luck? The game features a pity system that guarantees a brand new country after `X` consecutive duplicate rolls!

---

## 🚀 How to Run Locally

Want to test or modify the game on your machine? It's super simple!

### Prerequisites
You'll need to have **[Node.js](https://nodejs.org/)** installed on your computer (LTS version recommended).

### Steps:
1. **Open your Terminal** in the project folder.
2. **Install dependencies** by running the following command:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. 🎉 **Done!** The terminal will show you a local link (usually `http://localhost:5173`). Click it or copy it into your browser (Chrome, Edge, Firefox) to start playing!

---

## 🌐 How to Deploy (Put it Online)

The project is fully optimized for modern hosting platforms like **Netlify** or **Vercel**.

**Quick Method (Netlify Drop):**
1. In the project folder, run `npm run build`.
2. This will generate a `dist` folder.
3. Grab the `dist` folder and drag it directly into [Netlify Drop](https://app.netlify.com/drop). Your site will be online in 5 seconds!

*(The project already includes a `netlify.toml` file that automatically resolves routing and SPA linking issues).*

---

## ⚖️ Legal & Privacy Info

WorldDex was designed with user respect at the core of its architecture:

- 🔒 **Total Privacy (Offline-First)**: The game **has no external databases**, uses no marketing tracking cookies, and sends absolutely zero personal information to the cloud. All your progress, coins, and settings are saved **exclusively locally** on your device (via the browser's `localStorage`).
- 💾 **Export/Import**: Since there are no cloud accounts, you control your data. You can download your save file from the settings menu and load it onto another phone or PC.
- 📊 **Demographic Data**: Birth probabilities and rarities were calculated using global annual reports from the UN and world demographic databases (from recent years). These figures are approximate estimates intended for **entertainment, statistical, and educational purposes**, and may not reflect exact daily demographic fluctuations.
- 🎨 **Assets**: Icons and topographic vectors (*TopoJSON*) are derived from open-source public domain resources or MIT-licensed assets.

---
*Built with ❤️ using React, TypeScript, TailwindCSS, and Vite.*

