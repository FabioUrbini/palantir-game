# 🔮 Palantir Simulation - Interactive Intelligence Dashboard

A living, breathing **Palantir Gotham-style intelligence analysis platform** with interactive gameplay. Watch as entities appear, connections form, threats evolve, and critical alerts demand your strategic response—all driven by deterministic time-based procedural generation.

![Status](https://img.shields.io/badge/status-production%20ready-success)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎮 Features

### **Live Intelligence Simulation**
- **Time-Based Evolution:** The operation advances forward every second—entities spawn, events trigger, risk scores drift
- **Deterministic Generation:** Same seed = same state. Reproducible across sessions, no database required
- **5 Analytical Views:** Graph network, geospatial map, analytics dashboard, timeline, and query builder

### **Interactive Gameplay**
- 💰 **Resource Management:** Budget, agents, data credits, and influence
- 🕵️ **Entity Investigation:** Flag priorities, request intel, deploy watchlists, mark resolved
- ⚠️ **Time-Sensitive Alerts:** Critical events requiring strategic decisions with real consequences
- 📋 **Alert History:** Review dismissed and responded alerts

### **Premium Visual Design**
- Authentic Palantir Gotham aesthetic—dark cyber theme with cyan accents
- Smooth animations and transitions
- Real-time data visualization with Recharts
- Canvas-based entity network rendering

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
palantir-game/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with fonts
│   │   ├── page.tsx            # Main entry point
│   │   ├── globals.css         # Global styles + animations
│   │   └── ClientProviders.tsx # Client-side providers
│   │
│   ├── components/
│   │   ├── Dashboard.tsx       # Master layout
│   │   ├── TopBar.tsx          # Navigation + resources
│   │   ├── AlertTicker.tsx     # Live scrolling feed
│   │   ├── EntityActions.tsx   # Interactive action panel
│   │   ├── ResourceBar.tsx     # Player resource display
│   │   ├── InteractiveAlert.tsx # Time-sensitive alert modal
│   │   ├── AlertHistory.tsx    # Alert review panel
│   │   ├── ObjectivesPanel.tsx # Mission objectives tracker
│   │   ├── TutorialSystem.tsx  # Onboarding tutorial
│   │   ├── WelcomeModal.tsx    # First-time welcome
│   │   ├── views/              # 5 analytical views
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── engine/
│   │   ├── generator.ts        # Master procedural generator
│   │   ├── seed.ts            # Seeded PRNG (mulberry32)
│   │   ├── entities.ts        # Entity spawning logic
│   │   ├── connections.ts     # Relationship generator
│   │   ├── events.ts          # Timeline + interactive alerts
│   │   ├── sources.ts         # Data source simulation
│   │   ├── narrative.ts       # Operation phase progression
│   │   ├── objectives.ts      # Mission system
│   │   └── consequences.ts    # Action consequence system
│   │
│   ├── data/
│   │   ├── ontology.ts        # Type definitions
│   │   ├── templates.ts       # Name pools, event templates
│   │   └── theme.ts           # Color maps, visual config
│   │
│   ├── hooks/
│   │   ├── useSimulation.ts   # Master state hook
│   │   ├── usePersistence.ts  # LocalStorage save/load
│   │   ├── useToast.ts        # Toast notifications
│   │   ├── useSoundEffects.ts # Audio feedback
│   │   └── useTimeSync.ts     # Time synchronization
│   │
│   └── docs/
│       └── ARCHITECTURE.md    # Technical documentation
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

---

## 🎯 How It Works

### **Time-Based Procedural Generation**

All data is generated from the current time using a seeded PRNG:

```typescript
// Every second: UI animations, counters
// Every 30 seconds: Full state regeneration
// Every minute: New events may appear
// Every hour: New entities can spawn
// Every day: Operation phase advances
```

**Result:** No database, no backend—just pure deterministic chaos that looks alive.

### **Gameplay Loop**

1. **Resources regenerate** → Player has budget/agents/credits
2. **Player selects entity** → Investigation actions appear
3. **Player takes action** → Resources spent, investigation deepens
4. **Critical events trigger** → Interactive alert modal appears
5. **Player responds** → Consequences applied, resources deducted
6. **Investigation progresses** → Visual feedback (3 levels)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Zero-config Vercel deployment |
| **Language** | TypeScript 5.3 | Type safety for complex data |
| **UI** | React 18+ | Component-based architecture |
| **Charts** | Recharts 2.10 | Declarative analytics |
| **Rendering** | Canvas + SVG | High-performance visuals |
| **Styling** | Tailwind + CSS Variables | Utility-first + theming |
| **Fonts** | JetBrains Mono + Outfit | Monospace data + sans-serif |

---

## 📊 Views

### **1. GRAPH** 🕸️
Canvas-based entity relationship network with:
- Color-coded threat levels
- Real-time connection strength
- Drag-to-reposition nodes
- Animated critical entities

### **2. MAP** 🗺️
Geospatial intelligence visualization with:
- Mercator projection
- City-level precision
- Connection pathways
- Geographic distribution

### **3. ANALYTICS** 📈
Recharts dashboard featuring:
- 6 KPI cards
- Threat evolution timeline
- Network topology radar
- Risk matrix

### **4. TIMELINE** ⏱️
Chronological event feed with:
- Severity-coded entries
- Source attribution
- Entity linking
- Search/filter

### **5. QUERY** 🔍
Ontology query builder with:
- Visual query construction
- SQL preview
- Filtered results
- Export capability

---

## 🎨 Design System

### Colors
```typescript
--bg-primary: #050810       // Deep space black
--accent: #00e5ff          // Cyber cyan
--threat-critical: #ff2d55  // Danger red
--threat-high: #ff9500      // Warning orange
--threat-medium: #ffcc00    // Caution yellow
--threat-low: #30d158       // Safe green
```

### Typography
- **Data:** JetBrains Mono (7px-12px)
- **Text:** Outfit (10px-14px)

### Animations
- `ticker` - 80s infinite scroll
- `pulse` - 2s opacity oscillation
- `fadeIn` - 0.3s entrance
- `scaleIn` - 0.2s modal
- `ringPulse` - 1.5s expanding

---

## 🚢 Deployment

### **Vercel** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Static Export**

```bash
# Add to next.config.js:
module.exports = {
  output: 'export'
}

# Build static files
npm run build

# Deploy /out directory to any static host
```

### **Other Platforms**
- **Netlify:** Works out-of-the-box
- **Cloudflare Pages:** Supports Next.js
- **Railway:** Full Node.js support

---

## 🎮 Player Actions

### **Entity Investigation**
| Action | Cost | Effect |
|---|---|---|
| **Flag Priority** | Free | Mark for tracking |
| **Request Intel** | $100 + 1 credit | Deepen investigation (3 levels) |
| **Add to Watchlist** | 1 agent | Continuous monitoring |
| **Mark Resolved** | Free | Close investigation |

### **Alert Response**
| Option | Cost | Consequence |
|---|---|---|
| **Launch Investigation** | $500, 2 agents, 2 credits | Thorough threat analysis |
| **Enhanced Monitoring** | 1 agent | Passive surveillance |
| **Acknowledge Only** | Free | Risk may escalate |

---

## 📝 Development

### **Available Scripts**

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Create production build
npm start        # Run production server
npm run lint     # Run ESLint
```

### **Environment**
No environment variables required! The simulation is fully self-contained.

---

## 🧪 Architecture Highlights

### **Deterministic Randomness**
```typescript
// Seeded PRNG ensures reproducibility
const rng = mulberry32(timeSeed);
const value = rng(); // 0.0 - 1.0, deterministic
```

### **Component Design**
- **Composition over inheritance**
- **Pure functional components**
- **Controlled state management**
- **Single responsibility principle**

### **Performance**
- Canvas rendering for complex graphs
- Event history capped at 200 items
- Dual tick system (1s UI / 30s full regen)
- Lazy loading for heavy views

---

## 🐛 Known Issues

- [ ] Canvas nodes can overlap (needs force-directed layout)
- [ ] Limited mobile optimization (desktop-first design)
- [ ] Limited accessibility features (ARIA labels, keyboard nav)
- [ ] No error boundaries for graceful failure handling

---

## 🛣️ Roadmap

### **Phase 1** ✅ Complete
- [x] Core simulation engine
- [x] 5 analytical views
- [x] Resource management
- [x] Interactive alerts
- [x] Alert history
- [x] Tutorial system
- [x] Objectives/missions tracking
- [x] Save/load game state
- [x] Resource regeneration over time
- [x] Investigation consequences
- [x] Toast notification system

### **Phase 2** 📋 Planned
- [ ] Mini-games (Connection Decoder, Packet Sniffer, Dead Drop Timer)
- [ ] Achievement system
- [ ] Sound effects and audio feedback
- [ ] Enhanced mobile responsiveness
- [ ] Keyboard shortcuts

### **Phase 3** 💭 Future
- [ ] Multiplayer collaboration
- [ ] Real data source integration
- [ ] Custom scenario builder
- [ ] Multi-language support (i18n)
- [ ] Performance monitoring dashboard
- [ ] Mobile app

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

## 🙏 Acknowledgments

- **Palantir Technologies** - For the inspiring Gotham platform aesthetic
- **Next.js Team** - For the amazing framework
- **Recharts** - For the beautiful chart library
- **Ian Coleman** - For the mulberry32 PRNG algorithm

---

## 💬 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with 💙 by an AI assistant and human collaboration**

*"The truth is out there... in the data."*


##  Documentation

- **[Architecture Guide](src/docs/ARCHITECTURE.md)** - Deep dive into system design, data flow, and technical architecture
- **[AI Development Journey](AGENTS.md)** - How this project was built with AI-human collaboration
- **[Advanced Features](ADVANCED_FEATURES.md)** - Additional gameplay mechanics and systems

