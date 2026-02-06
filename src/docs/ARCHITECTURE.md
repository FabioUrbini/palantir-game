# 🏗️ Architecture Documentation

**Palantir Simulation - System Architecture**  
**Version:** 0.1.0  
**Last Updated:** 2026-02-06

---

## 📐 System Overview

The Palantir Simulation is a **deterministic, time-based procedural intelligence dashboard** with interactive gameplay elements. The architecture is designed around a core principle: **all state is derived from the current time** using seeded randomness, eliminating the need for a traditional database while maintaining consistency across sessions.

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (React Components + Canvas/SVG Rendering)               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                 State Management                         │
│        (useSimulation Hook + React State)                │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               Procedural Engine                          │
│  (Time-Seeded Generators + Deterministic Logic)          │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                  Data Layer                              │
│      (Type Definitions + Templates + Theme)              │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Architecture Patterns

### **1. Deterministic Procedural Generation**

**Pattern:** Seeded PRNG (mulberry32)  
**Location:** `engine/seed.ts`

All randomness is deterministic and reproducible:

```typescript
// Same seed → Same output
const rng = mulberry32(timeSeed);
const value = rng(); // 0.0 - 1.0, always the same for this seed
```

**Benefits:**
- ✅ No database required
- ✅ Reproducible states across sessions
- ✅ Easy debugging and testing
- ✅ Time-travel possible (replay any moment)

**Time Granularity:**
```
Second  → UI animations, counter ticks
Minute  → Event generation, risk scoring
Hour    → Entity spawning, connection formation
Day     → Operation phase transitions
```

---

### **2. Single State Tree**

**Pattern:** Centralized State Management  
**Location:** `hooks/useSimulation.ts`

All application state flows through a single hook:

```typescript
export function useSimulation(): UseSimulationReturn {
  const [state, setState] = useState<SimulationState>(() => getSimulationState());
  // ... tick logic, action handlers
  return { state, handlers };
}
```

**State Structure:**
```typescript
SimulationState {
  entities: Entity[]           // All intelligence entities
  connections: Connection[]    // Relationships between entities
  events: TimelineEvent[]      // Intelligence events
  alerts: Alert[]              // Current active alerts
  sources: DataSource[]        // SIGINT, FININT, etc.
  phase: Phase                 // Operation narrative phase
  playerResources: {...}       // Budget, agents, credits, influence
  // ... time tracking
}
```

**Update Cycle:**
- **Fast Tick (1s):** UI counters, animations
- **Slow Tick (30s):** Full state regeneration from time

---

### **3. Component Composition**

**Pattern:** Atomic Design + Compound Components  
**Structure:**

```
Atoms (ui/)
  ├── ProgressRing      - SVG circular progress
  ├── AnimatedNumber    - Count-up animation
  ├── LiveCounter       - Real-time incrementing
  └── MiniSparkline     - Tiny charts

Molecules (components/)
  ├── ResourceBar       - Player resources display
  ├── EntityActions     - Action button panel
  └── AlertHistory      - Modal panel

Organisms (components/)
  ├── TopBar            - Navigation + status
  ├── AlertTicker       - Scrolling feed
  ├── DataSourcePanel   - Left sidebar
  └── EntityDetailPanel - Right sidebar

Templates (views/)
  ├── GraphView         - Canvas network
  ├── MapView           - SVG geospatial
  ├── AnalyticsView     - Charts dashboard
  ├── TimelineView      - Event feed
  └── QueryView         - Query builder

Pages (app/)
  └── Dashboard         - Master layout
```

---

## 🎨 Layer Architecture

### **Layer 1: Data Layer** (`/data`)

**Responsibility:** Type definitions, templates, theme configuration

```typescript
ontology.ts    // TypeScript interfaces (Entity, Event, etc.)
templates.ts   // Name pools, event templates, connection types
theme.ts       // Color maps, icon mappings, font config
```

**Key Types:**
- `Entity` - Intelligence target (person, company, location, etc.)
- `Connection` - Relationship between entities
- `TimelineEvent` - Intelligence event with optional player interaction
- `PlayerResources` - Budget, agents, data credits, influence

---

### **Layer 2: Engine Layer** (`/engine`)

**Responsibility:** Procedural generation, simulation logic

```typescript
seed.ts         // Seeded PRNG + time-seed utilities
generator.ts    // Master state generator (orchestrator)
entities.ts     // Entity pool + spawning logic
connections.ts  // Relationship generation
events.ts       // Timeline event + interactive alert generation
sources.ts      // Data source state + counter simulation
narrative.ts    // Operation phase progression
```

**Data Flow:**
```
Time → Seed → PRNG → Entity → Connection → Event → State
```

**Key Functions:**
- `getSimulationState()` - Master generator, called every 30s
- `generateSpawnedEntities()` - Creates new entities over time
- `generateEvents()` - Creates timeline events with interactive alerts
- `updateRiskScores()` - Drifts entity risk values

---

### **Layer 3: State Management** (`/hooks`)

**Responsibility:** Application state, side effects, player actions

```typescript
useSimulation.ts    // Master hook (state + handlers)
```

**Responsibilities:**
- ✅ Manage simulation state
- ✅ Handle tick intervals (1s + 30s)
- ✅ Process player actions (investigation, alert responses)
- ✅ Track dismissed alerts
- ✅ Expose state and handlers to UI

**Action Handlers:**
```typescript
handleEntityAction(entityId, action)    // Flag, investigate, watchlist, resolve
handleAlertResponse(eventId, optionId)  // Respond to interactive alerts
reviewAlert(event)                      // Re-trigger dismissed alert
```

---

### **Layer 4: UI Layer** (`/components`)

**Responsibility:** Presentation, user interaction, visual feedback

**Main Components:**

#### **Dashboard** (Master Layout)
- Orchestrates all views and panels
- Manages view switching (graph/map/analytics/timeline/query)
- Renders modal overlays (InteractiveAlert, AlertHistory)

#### **TopBar** (Navigation + Status)
- Logo, view tabs, resource bar, clock
- Shows operation phase and alert level

#### **AlertTicker** (Live Feed)
- Scrolling marquee of recent alerts
- Clickable for interactive alerts
- Color-coded by severity

#### **DataSourcePanel** (Left Sidebar)
- 8 intelligence sources (SIGINT, FININT, etc.)
- Toggle filtering
- Live counters and status indicators

#### **EntityDetailPanel** (Right Sidebar)
- Shows selected entity details
- Investigation actions panel
- Connection list, timeline events, sparklines

#### **InteractiveAlert** (Modal)
- Time-sensitive alert with countdown
- Multiple response options with costs
- Visual severity indicators

#### **AlertHistory** (Sliding Panel)
- Dismissed/responded alert archive
- Review functionality
- Status tracking

---

### **Layer 5: View Layer** (`/components/views`)

**Responsibility:** Domain-specific visualizations

#### **GraphView** (Canvas)
```
Technology: HTML5 Canvas API
Purpose: Entity relationship network
Features: 
  - Drag-to-reposition nodes
  - Color-coded by threat level
  - Animated pulse rings for critical entities
  - Connection strength visualization
```

#### **MapView** (SVG)
```
Technology: SVG with Mercator projection
Purpose: Geospatial intelligence
Features:
  - City-level entity markers
  - Geographic connection pathways
  - Animated critical markers
  - Coordinate display
```

#### **AnalyticsView** (Recharts)
```
Technology: Recharts (React charts)
Purpose: KPI dashboard
Features:
  - 6 KPI cards
  - Area chart (threat evolution)
  - Pie chart (threat distribution)
  - Radar chart (network topology)
  - Bar charts (sources, geography)
  - Risk matrix table
```

#### **TimelineView** (List)
```
Technology: React list rendering
Purpose: Chronological event feed
Features:
  - Severity-coded rows
  - Source attribution
  - Entity linking
  - Click to filter
```

#### **QueryView** (Query Builder)
```
Technology: React form + filters
Purpose: Ontology query construction
Features:
  - Visual query builder
  - SQL preview
  - Filtered result cards
  - Export capability
```

---

## 🔄 Data Flow Diagrams

### **State Generation Flow**

```
┌──────────────┐
│  Date.now()  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Compute Time Seeds  │
│  (minute/hour/day)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Generate Entities   │
│  (base + spawned)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate Connections │
│  (based on sources)  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Generate Events     │
│  (+ interactive)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Update Risk Scores  │
│  (drift over time)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Generate Alerts     │
│  (from events)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Return Full State   │
│  (SimulationState)   │
└──────────────────────┘
```

### **Player Action Flow**

```
┌─────────────────┐
│  User Clicks    │
│  Action Button  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  handleEntityAction │
│  (in useSimulation) │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Validate Resources │
│  (can afford?)      │
└────────┬────────────┘
         │ Yes
         ▼
┌─────────────────────┐
│  Update Entity      │
│  (flags, level)     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Deduct Resources   │
│  (budget/agents)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  setState()         │
│  (trigger re-render)│
└─────────────────────┘
```

---

## 🎮 Gameplay Architecture

### **Resource System**

```typescript
PlayerResources {
  budget: number        // Starting: $10,000
  maxBudget: number     // Cap: $10,000
  agents: number        // Starting: 8
  maxAgents: number     // Cap: 10
  dataCredits: number   // Starting: 10
  influence: number     // Starting: 50
}
```

**Resource Flow:**
- Actions **deduct** resources immediately
- Resources **regenerate** over time (Phase 2)
- Resources **constrain** player choices

### **Investigation System**

```typescript
Entity {
  playerFlags?: {
    priority: boolean      // Flagged for tracking
    watchlist: boolean     // Under surveillance
    investigated: boolean  // Intel requested
    resolved: boolean      // Case closed
  }
  investigationLevel?: number  // 0-3 (depth)
  lastActionTime?: number      // Cooldown tracking
}
```

**Progression:**
```
Select Entity → Take Action → Spend Resources → Update State → Visual Feedback
```

### **Alert System**

```typescript
TimelineEvent {
  requiresResponse?: boolean
  responseOptions?: ResponseOption[]
  responseDeadline?: string
  playerResponse?: string
}
```

**Alert Lifecycle:**
```
Event Generation → Auto-Trigger → Player Response → Apply Consequences → Archive
```

---

## 🔐 Security & Performance

### **Security Considerations**
- ✅ No user input stored (XSS-safe)
- ✅ No external API calls (CSRF-safe)
- ✅ Client-side only (no backend vulnerabilities)
- ⚠️ Ensure CSP headers in production

### **Performance Optimizations**

**Canvas Rendering:**
- 2x DPI for retina displays
- Dirty rectangle rendering (future)
- RequestAnimationFrame for animations

**State Management:**
- Event capping (max 200)
- Dual tick rates (1s/30s)
- Lazy view loading (only active view renders)

**Memory Management:**
- Set-based filtering (O(1) lookups)
- Shallow cloning for state updates
- Component memoization (future)

---

## 🧪 Testing Strategy

### **Unit Tests** (Planned)
```
/engine tests
  ✓ seed.ts - PRNG consistency
  ✓ entities.ts - Spawning logic
  ✓ connections.ts - Relationship rules
  ✓ events.ts - Event generation
```

### **Integration Tests** (Planned)
```
/hooks tests
  ✓ useSimulation.ts - State transitions
  ✓ Player actions - Resource deduction
  ✓ Alert system - Response handling
```

### **E2E Tests** (Planned)
```
User flows
  ✓ Entity investigation workflow
  ✓ Alert response workflow
  ✓ View switching
  ✓ Resource management
```

---

## 📦 Build & Deployment

### **Build Pipeline**

```bash
# Development
npm run dev        # Next.js dev server with hot reload

# Production
npm run build      # Optimized production build
npm start          # Production server
```

### **Output Structure**

```
.next/
  ├── static/           # Static assets
  ├── server/           # Server pages
  └── cache/            # Build cache
```

### **Deployment Targets**

1. **Vercel** (Recommended)
   - Zero config
   - Automatic HTTPS
   - Global CDN
   - Edge functions

2. **Static Export**
   ```javascript
   // next.config.js
   module.exports = { output: 'export' }
   ```
   - Deploy to any static host
   - No server required
   - Limited features (no API routes)

3. **Docker** (Future)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm ci && npm run build
   CMD ["npm", "start"]
   ```

---

## 🔮 Future Architecture Considerations

### **Scalability**
- [ ] WebWorker for heavy computations
- [ ] Service Worker for offline mode
- [ ] IndexedDB for state persistence
- [ ] WebSocket for multiplayer

### **Modularity**
- [ ] Plugin system for custom views
- [ ] Theme customization API
- [ ] Scenario builder framework
- [ ] Export/import state format

### **Performance**
- [ ] Code splitting by route
- [ ] Image optimization (next/image)
- [ ] Font subsetting
- [ ] Bundle analyzer integration

---

## 📚 References

- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks Guide](https://react.dev/reference/react)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Recharts Documentation](https://recharts.org/)
- [Mulberry32 PRNG](https://github.com/bryc/code/blob/master/jshash/PRNGs.md)

---

**Maintained by:** Development Team  
**Last Review:** 2026-02-06  
**Version:** 0.1.0
