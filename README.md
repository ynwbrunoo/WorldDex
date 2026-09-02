# WorldDex

?? **WorldDex: Unlock the World, One Birth at a Time**

WorldDex is a web-based gacha game where you collect countries of the world. The drop rates are accurately based on real-world birth rates—meaning you're statistically just as likely to roll a country as you are to be born there in real life!

## Features
- **Real-World Drop Rates**: Probabilities based on real population and birth data.
- **Pity System**: Ensures you eventually unlock new countries if you hit too many duplicates.
- **Collection & Achievements**: Collect all ~200 countries, complete continents, and form geopolitical groups (EU, BRICS, PALOP, NATO, etc.) to earn achievements.
- **In-Game Shop**: Use duplicate coins to buy upgrades like Auto-Roller, Coin Multipliers, and Luck Boosts.
- **Interactive Map**: View your unlocked countries on a beautiful interactive world map.
- **Multilingual Support**: Fully localized in English, Portuguese, Spanish, French, and several African dialects (Cape Verdean Creole, Kimbundu, Umbundu, Kikongo).
- **Offline & Private**: 100% of your progress is saved locally in your browser (localStorage). No tracking, no servers.

## Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion (for animations)
- **State Management**: React useReducer & Context API
- **Maps**: d3-geo, 
eact-simple-maps, and 	opojson-client
- **i18n**: i18next & 
eact-i18next

## Getting Started

1. Clone the repository
2. Install dependencies: 
npm install
3. Run the development server: 
npm run dev
4. Build for production: 
npm run build

## Deployment
This project is pre-configured for deployment on Netlify. A 
etlify.toml is included to handle SPA routing and build output directories.

## License
MIT License

