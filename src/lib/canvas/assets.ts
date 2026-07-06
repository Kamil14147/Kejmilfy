import { CanvasElement, makeId } from "./types";

export interface Template {
  id: string;
  name: string;
  category: string;
  preview?: { background?: string };
  elements: (pageW: number, pageH: number) => CanvasElement[];
}

export const ICONS = [
  "Star", "Heart", "Smile", "ThumbsUp", "Bell", "Bookmark", "Flag", "Award",
  "Zap", "Sun", "Moon", "Cloud", "Snowflake", "Umbrella", "Coffee", "Pizza",
  "Cake", "Apple", "Carrot", "IceCream", "Cherry", "Crown", "Gem", "Trophy",
  "Target", "Compass", "MapPin", "Navigation", "Plane", "Car", "Bike", "Bus",
  "Train", "Ship", "Rocket", "Home", "Building", "Building2", "Tent", "Castle",
  "Church", "Landmark", "Mountain", "Tree", "Trees", "Flower", "Leaf", "Waves",
  "Droplet", "Wind", "Fire", "Sparkles", "Hexagon", "Octagon", "Shield",
  "Sword", "Hammer", "Wrench", "Cog", "Bulb", "Lightbulb", "Cpu", "Smartphone",
  "Laptop", "Monitor", "Tv", "Camera", "Video", "Film", "Music", "Headphones",
  "Mic", "Radio", "Phone", "Mail", "MessageSquare", "MessageCircle", "Send",
  "Inbox", "AtSign", "Hash", "Link", "Share", "Share2", "Eye", "EyeOff",
  "Lock", "Unlock", "Key", "Fingerprint", "User", "Users", "UserPlus", "UserCheck",
  "Search", "Filter", "Sliders", "Settings", "Gear", "Tool", "Calendar", "Clock",
  "Timer", "Hourglass", "AlarmClock", "Watch", "Battery", "Plug", "Power", "Toggle",
  "Wifi", "Bluetooth", "Signal", "Activity", "Pulse", "Health", "Stethoscope", "Pill",
  "Cross", "Plus", "Minus", "X", "Check", "Dot", "Circle", "Square",
  "Triangle", "Pentagon", "Diamond", "Flower", "Sun",
];

// Helper to create text element
const txt = (overrides: Partial<any> & { x: number; y: number; width: number; height: number; text: string }): any => ({
  id: makeId("txt"),
  type: "text",
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  fontFamily: "Inter",
  fontSize: 48,
  fontWeight: 700,
  fontStyle: "normal",
  textDecoration: "none",
  textAlign: "center",
  color: "#0f172a",
  lineHeight: 1.2,
  letterSpacing: 0,
  padding: 0,
  ...overrides,
});

const shp = (overrides: Partial<any> & { x: number; y: number; width: number; height: number; type: any }): any => ({
  id: makeId("shp"),
  rotation: 0,
  opacity: 1,
  locked: false,
  visible: true,
  fill: "#6366f1",
  stroke: "transparent",
  strokeWidth: 0,
  ...overrides,
});

const bg = (overrides: Partial<any>): any => ({
  id: makeId("shp"),
  type: "rectangle",
  x: 0, y: 0, rotation: 0, opacity: 1, locked: false, visible: true,
  fill: "#ffffff", stroke: "transparent", strokeWidth: 0,
  ...overrides,
  width: overrides.width || 1080,
  height: overrides.height || 1080,
});

export const TEMPLATES: Template[] = [
  // ============= SOCIAL MEDIA =============

  {
    id: "tpl-promo-sale",
    name: "Wyprzedaż",
    category: "Social Media",
    preview: { background: "linear-gradient(135deg, #f59e0b, #ef4444)" },
    elements: (w, h) => [
      bg({ fill: "#ef4444", gradient: { from: "#f59e0b", to: "#ef4444", angle: 135 }, width: w, height: h }),
      // Decorative circles
      shp({ type: "ellipse", x: -w * 0.15, y: -h * 0.15, width: w * 0.5, height: w * 0.5, fill: "#fef3c7", opacity: 0.2 }),
      shp({ type: "ellipse", x: w * 0.75, y: h * 0.7, width: w * 0.4, height: w * 0.4, fill: "#7c2d12", opacity: 0.3 }),
      // Diagonal stripe
      shp({ type: "rectangle", x: -100, y: h * 0.45, width: w + 200, height: 8, fill: "#fef3c7", rotation: -8 }),
      // Big text
      txt({ x: w * 0.05, y: h * 0.1, width: w * 0.9, height: 100, text: "WIELKA WYPRZEDAŻ", fontSize: 72, fontWeight: 900, color: "#ffffff", letterSpacing: -1 }),
      // Percentage
      txt({ x: w * 0.05, y: h * 0.25, width: w * 0.9, height: 350, text: "-70%", fontSize: 360, fontWeight: 900, color: "#fef3c7", shadow: "0 10px 40px rgba(0,0,0,0.3)", letterSpacing: -15 }),
      // Subtitle
      txt({ x: w * 0.05, y: h * 0.72, width: w * 0.9, height: 60, text: "na całą kolekcję letnią", fontFamily: "Georgia", fontSize: 42, fontWeight: 400, fontStyle: "italic", color: "#ffffff" }),
      // Code
      txt({ x: w * 0.05, y: h * 0.85, width: w * 0.9, height: 40, text: "Kod: SUMMER70  •  kejmilfy.shop", fontSize: 22, fontWeight: 600, color: "#fef3c7", letterSpacing: 2 }),
    ],
  },

  {
    id: "tpl-quote-dark",
    name: "Cytat",
    category: "Social Media",
    preview: { background: "#0f172a" },
    elements: (w, h) => [
      bg({ fill: "#0f172a", width: w, height: h }),
      // Decorative blob
      shp({ type: "ellipse", x: w * 0.6, y: -h * 0.2, width: w * 0.6, height: w * 0.6, fill: "#6366f1", opacity: 0.15 }),
      shp({ type: "ellipse", x: -w * 0.2, y: h * 0.7, width: w * 0.5, height: w * 0.5, fill: "#ec4899", opacity: 0.1 }),
      // Giant quote mark
      txt({ x: w * 0.05, y: -h * 0.05, width: w * 0.4, height: 400, text: "\u201C", fontFamily: "Georgia", fontSize: 500, fontWeight: 700, color: "#6366f1", opacity: 0.3, textAlign: "left" }),
      // Quote
      txt({ x: w * 0.1, y: h * 0.3, width: w * 0.8, height: h * 0.4, text: "Najlepszy sposób na przewidywanie przyszłości to stworzenie jej.", fontFamily: "Georgia", fontSize: 56, fontWeight: 400, fontStyle: "italic", color: "#ffffff", lineHeight: 1.3, textAlign: "center" }),
      // Divider
      shp({ type: "line", x: w * 0.4, y: h * 0.78, width: w * 0.2, height: 2, fill: "#6366f1" }),
      // Author
      txt({ x: w * 0.1, y: h * 0.83, width: w * 0.8, height: 40, text: "PETER DRUCKER", fontSize: 20, fontWeight: 600, color: "#a5b4fc", letterSpacing: 5 }),
    ],
  },

  {
    id: "tpl-new-product",
    name: "Nowy produkt",
    category: "Social Media",
    preview: { background: "#10b981" },
    elements: (w, h) => [
      bg({ fill: "#10b981", width: w, height: h }),
      // Top stripe
      shp({ type: "rectangle", x: 0, y: 0, width: w, height: h * 0.08, fill: "#0f172a" }),
      txt({ x: 0, y: h * 0.02, width: w, height: h * 0.06, text: "NOWOŚĆ 2026", fontSize: 28, fontWeight: 700, color: "#10b981", letterSpacing: 6 }),
      // Circle with star
      shp({ type: "ellipse", x: w * 0.3, y: h * 0.15, width: w * 0.4, height: w * 0.4, fill: "#0f172a" }),
      shp({ type: "ellipse", x: w * 0.33, y: h * 0.18, width: w * 0.34, height: w * 0.34, fill: "transparent", stroke: "#10b981", strokeWidth: 3 }),
      txt({ x: w * 0.3, y: h * 0.27, width: w * 0.4, height: w * 0.2, text: "★", fontSize: 200, color: "#10b981", lineHeight: 1 }),
      // Title
      txt({ x: w * 0.05, y: h * 0.62, width: w * 0.9, height: 100, text: "Poznaj naszą\nnową kolekcję", fontFamily: "Georgia", fontSize: 64, fontWeight: 700, color: "#0f172a", lineHeight: 1, letterSpacing: -1 }),
      // Button
      shp({ type: "rectangle", x: w * 0.25, y: h * 0.85, width: w * 0.5, height: 70, fill: "#0f172a", radius: 35 }),
      txt({ x: w * 0.25, y: h * 0.85, width: w * 0.5, height: 70, text: "Sprawdź →", fontSize: 24, fontWeight: 700, color: "#10b981", lineHeight: 2.9 }),
    ],
  },

  {
    id: "tpl-event-invite",
    name: "Zaproszenie",
    category: "Social Media",
    preview: { background: "#7c2d12" },
    elements: (w, h) => [
      bg({ fill: "#7c2d12", width: w, height: h }),
      // Border frame
      shp({ type: "rectangle", x: 30, y: 30, width: w - 60, height: h - 60, fill: "transparent", stroke: "#fef3c7", strokeWidth: 2 }),
      shp({ type: "rectangle", x: 40, y: 40, width: w - 80, height: h - 80, fill: "transparent", stroke: "#fef3c7", strokeWidth: 1 }),
      // Top label
      txt({ x: w * 0.1, y: h * 0.1, width: w * 0.8, height: 40, text: "ZAPRASZAMY NA", fontSize: 24, fontWeight: 600, color: "#fbbf24", letterSpacing: 8 }),
      // Title
      txt({ x: w * 0.1, y: h * 0.2, width: w * 0.8, height: 250, text: "Wernisaż\nSztuki\nNowoczesnej", fontFamily: "Georgia", fontSize: 88, fontWeight: 700, color: "#fef3c7", lineHeight: 0.95, letterSpacing: -2 }),
      // Divider
      shp({ type: "line", x: w * 0.35, y: h * 0.6, width: w * 0.3, height: 2, fill: "#fbbf24" }),
      // Date
      txt({ x: w * 0.1, y: h * 0.65, width: w * 0.8, height: 60, text: "15 LIPCA 2026", fontSize: 36, fontWeight: 700, color: "#fef3c7", letterSpacing: 4 }),
      txt({ x: w * 0.1, y: h * 0.72, width: w * 0.8, height: 40, text: "godz. 19:00", fontFamily: "Georgia", fontSize: 24, fontWeight: 400, fontStyle: "italic", color: "#fbbf24" }),
      // Venue
      txt({ x: w * 0.1, y: h * 0.85, width: w * 0.8, height: 50, text: "Galeria Sztuki\nul. Piękna 5, Warszawa", fontFamily: "Georgia", fontSize: 20, fontWeight: 400, color: "#fef3c7", lineHeight: 1.3 }),
    ],
  },

  {
    id: "tpl-recipe",
    name: "Przepis",
    category: "Social Media",
    preview: { background: "#fef3c7" },
    elements: (w, h) => [
      bg({ fill: "#fef3c7", width: w, height: h }),
      // Top color block
      shp({ type: "rectangle", x: 0, y: 0, width: w, height: h * 0.4, fill: "#f59e0b", radius: 0 }),
      // Emoji food
      txt({ x: 0, y: h * 0.05, width: w, height: h * 0.3, text: "🥐", fontSize: 280, lineHeight: 1 }),
      // Title
      txt({ x: w * 0.08, y: h * 0.45, width: w * 0.84, height: 120, text: "Croissanty\nmaślane", fontFamily: "Georgia", fontSize: 72, fontWeight: 700, color: "#7c2d12", lineHeight: 0.95, letterSpacing: -1 }),
      // Time + portions
      txt({ x: w * 0.1, y: h * 0.68, width: w * 0.8, height: 40, text: "⏱  45 min     🍰  8 porcji", fontSize: 26, fontWeight: 500, color: "#92400e" }),
      // Divider
      shp({ type: "line", x: w * 0.3, y: h * 0.78, width: w * 0.4, height: 2, fill: "#7c2d12" }),
      // Footer
      txt({ x: w * 0.1, y: h * 0.84, width: w * 0.8, height: 30, text: "kejmilfy • przepisy", fontSize: 18, fontWeight: 600, color: "#92400e", letterSpacing: 4 }),
    ],
  },

  {
    id: "tpl-stats-post",
    name: "Statystyka",
    category: "Social Media",
    preview: { background: "#1e293b" },
    elements: (w, h) => [
      bg({ fill: "#1e293b", width: w, height: h }),
      // Accent bar
      shp({ type: "rectangle", x: 0, y: 0, width: 12, height: h, fill: "#06b6d4" }),
      // Label
      txt({ x: w * 0.08, y: h * 0.1, width: w * 0.84, height: 40, text: "CIEKAWOSTKA DNIA", fontSize: 22, fontWeight: 600, color: "#06b6d4", letterSpacing: 5 }),
      // Big number
      txt({ x: w * 0.08, y: h * 0.22, width: w * 0.84, height: 300, text: "87%", fontFamily: "Inter", fontSize: 280, fontWeight: 900, color: "#ffffff", lineHeight: 0.9, letterSpacing: -8 }),
      // Description
      txt({ x: w * 0.08, y: h * 0.6, width: w * 0.84, height: 100, text: "osób zauważa poprawę produktywności po wdrożeniu narzędzi do zarządzania czasem", fontFamily: "Georgia", fontSize: 32, fontWeight: 400, color: "#94a3b8", lineHeight: 1.3 }),
      // Source
      shp({ type: "line", x: w * 0.08, y: h * 0.82, width: 60, height: 2, fill: "#06b6d4" }),
      txt({ x: w * 0.08, y: h * 0.85, width: w * 0.84, height: 30, text: "Źródło: Badania kejmilfy 2026", fontSize: 16, fontWeight: 400, fontStyle: "italic", color: "#64748b", fontFamily: "Georgia" }),
    ],
  },

  // ============= PRESENTATIONS =============

  {
    id: "tpl-pres-title",
    name: "Tytuł prezentacji",
    category: "Presentation",
    preview: { background: "#0f172a" },
    elements: (w, h) => [
      bg({ fill: "#0f172a", width: w, height: h }),
      // Bottom accent
      shp({ type: "rectangle", x: 0, y: h * 0.85, width: w, height: h * 0.15, fill: "#6366f1" }),
      // Decorative
      shp({ type: "ellipse", x: w * 0.7, y: -h * 0.2, width: h * 0.6, height: h * 0.6, fill: "#6366f1", opacity: 0.2 }),
      // Label
      txt({ x: w * 0.08, y: h * 0.15, width: w * 0.84, height: 40, text: "PREZENTACJA  •  Q3 2026", fontSize: 22, fontWeight: 600, color: "#6366f1", letterSpacing: 4 }),
      // Title
      txt({ x: w * 0.08, y: h * 0.28, width: w * 0.84, height: 200, text: "Strategia\nwzrostu 2026", fontFamily: "Georgia", fontSize: 96, fontWeight: 700, color: "#ffffff", lineHeight: 1, letterSpacing: -2 }),
      // Subtitle
      txt({ x: w * 0.08, y: h * 0.55, width: w * 0.84, height: 50, text: "Jak podwoimy przychody w 4 kwartałach", fontFamily: "Georgia", fontSize: 28, fontWeight: 400, fontStyle: "italic", color: "#94a3b8" }),
      // Author
      txt({ x: w * 0.08, y: h * 0.9, width: w * 0.84, height: 40, text: "Jan Kowalski  •  CEO", fontSize: 20, fontWeight: 500, color: "#ffffff" }),
    ],
  },

  {
    id: "tpl-pres-data",
    name: "Slajd z danymi",
    category: "Presentation",
    preview: { background: "#ffffff" },
    elements: (w, h) => [
      bg({ fill: "#ffffff", width: w, height: h }),
      // Side accent
      shp({ type: "rectangle", x: 0, y: 0, width: 12, height: h, fill: "#6366f1" }),
      // Section
      txt({ x: w * 0.05, y: h * 0.08, width: w * 0.9, height: 40, text: "WYNIKI Q3", fontSize: 22, fontWeight: 600, color: "#6366f1", letterSpacing: 4 }),
      // Title
      txt({ x: w * 0.05, y: h * 0.15, width: w * 0.6, height: 100, text: "Wzrost o 247%", fontSize: 96, fontWeight: 800, color: "#0f172a", letterSpacing: -3 }),
      // Description
      txt({ x: w * 0.05, y: h * 0.3, width: w * 0.6, height: 50, text: "w skonsolidowanych przychodach rok do roku", fontFamily: "Georgia", fontSize: 24, fontWeight: 400, fontStyle: "italic", color: "#64748b" }),
      // Three stat cards
      shp({ type: "rectangle", x: w * 0.05, y: h * 0.55, width: w * 0.27, height: h * 0.35, fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: 1, radius: 16 }),
      txt({ x: w * 0.07, y: h * 0.62, width: w * 0.23, height: 70, text: "€12.4M", fontSize: 48, fontWeight: 700, color: "#10b981", letterSpacing: -1 }),
      txt({ x: w * 0.07, y: h * 0.78, width: w * 0.23, height: 30, text: "Przychody", fontSize: 18, fontWeight: 500, color: "#64748b" }),

      shp({ type: "rectangle", x: w * 0.36, y: h * 0.55, width: w * 0.27, height: h * 0.35, fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: 1, radius: 16 }),
      txt({ x: w * 0.38, y: h * 0.62, width: w * 0.23, height: 70, text: "+34%", fontSize: 48, fontWeight: 700, color: "#6366f1", letterSpacing: -1 }),
      txt({ x: w * 0.38, y: h * 0.78, width: w * 0.23, height: 30, text: "Marża", fontSize: 18, fontWeight: 500, color: "#64748b" }),

      shp({ type: "rectangle", x: w * 0.67, y: h * 0.55, width: w * 0.27, height: h * 0.35, fill: "#f8fafc", stroke: "#e2e8f0", strokeWidth: 1, radius: 16 }),
      txt({ x: w * 0.69, y: h * 0.62, width: w * 0.23, height: 70, text: "8.2K", fontSize: 48, fontWeight: 700, color: "#f59e0b", letterSpacing: -1 }),
      txt({ x: w * 0.69, y: h * 0.78, width: w * 0.23, height: 30, text: "Nowi klienci", fontSize: 18, fontWeight: 500, color: "#64748b" }),
    ],
  },

  // ============= DOCUMENTS =============

  {
    id: "tpl-resume",
    name: "CV / Resume",
    category: "Document",
    preview: { background: "#ffffff" },
    elements: (w, h) => [
      bg({ fill: "#ffffff", width: w, height: h }),
      // Left sidebar
      shp({ type: "rectangle", x: 0, y: 0, width: w * 0.32, height: h, fill: "#1e293b" }),
      // Avatar circle
      shp({ type: "ellipse", x: w * 0.08, y: h * 0.05, width: w * 0.16, height: w * 0.16, fill: "#6366f1" }),
      txt({ x: w * 0.08, y: h * 0.05 + w * 0.05, width: w * 0.16, height: w * 0.1, text: "JK", fontSize: 64, fontWeight: 800, color: "#ffffff", lineHeight: 1 }),
      // Contact label
      txt({ x: w * 0.04, y: h * 0.3, width: w * 0.24, height: 30, text: "KONTAKT", fontSize: 13, fontWeight: 700, color: "#6366f1", letterSpacing: 3 }),
      txt({ x: w * 0.04, y: h * 0.34, width: w * 0.24, height: 120, text: "jan@email.com\n+48 600 100 200\nul. Marszałkowska 1\n01-001 Warszawa", fontSize: 12, fontWeight: 400, color: "#cbd5e1", lineHeight: 1.6, textAlign: "left" }),
      // Skills
      txt({ x: w * 0.04, y: h * 0.55, width: w * 0.24, height: 30, text: "UMIEJĘTNOŚCI", fontSize: 13, fontWeight: 700, color: "#6366f1", letterSpacing: 3 }),
      txt({ x: w * 0.04, y: h * 0.59, width: w * 0.24, height: 150, text: "TypeScript / React\nNode.js / Next.js\nUI/UX Design\nFigma • Tailwind\nZarządzanie zespołem", fontSize: 12, fontWeight: 400, color: "#cbd5e1", lineHeight: 1.8, textAlign: "left" }),
      // Right column
      txt({ x: w * 0.36, y: h * 0.05, width: w * 0.6, height: 70, text: "Jan Kowalski", fontFamily: "Georgia", fontSize: 52, fontWeight: 700, color: "#0f172a", lineHeight: 1, letterSpacing: -1, textAlign: "left" }),
      txt({ x: w * 0.36, y: h * 0.14, width: w * 0.6, height: 30, text: "Senior Frontend Developer", fontSize: 18, fontWeight: 500, color: "#6366f1", letterSpacing: 1, textAlign: "left" }),
      shp({ type: "line", x: w * 0.36, y: h * 0.2, width: w * 0.56, height: 2, fill: "#e2e8f0" }),
      // Experience
      txt({ x: w * 0.36, y: h * 0.24, width: w * 0.56, height: 30, text: "DOŚWIADCZENIE", fontSize: 13, fontWeight: 700, color: "#0f172a", letterSpacing: 3, textAlign: "left" }),
      txt({ x: w * 0.36, y: h * 0.3, width: w * 0.56, height: 250, text: "Senior Frontend Developer\nAcme Corp • 2022 — obecnie\n\n• Prowadzenie zespołu 5 developerów\n• Architektura aplikacji w Next.js 16\n• Wzrost wydajności o 240%\n\nFrontend Developer\nStartupX • 2019 — 2022\n\n• Implementacja design systemu\n• Migracja z CRA do Next.js", fontSize: 12, fontWeight: 400, color: "#334155", lineHeight: 1.55, textAlign: "left" }),
      // Education
      txt({ x: w * 0.36, y: h * 0.74, width: w * 0.56, height: 30, text: "EDUKACJA", fontSize: 13, fontWeight: 700, color: "#0f172a", letterSpacing: 3, textAlign: "left" }),
      txt({ x: w * 0.36, y: h * 0.8, width: w * 0.56, height: 100, text: "Magister Informatyki\nPolitechnika Warszawska • 2015-2020\n\nSpecjalizacja: Inżynieria oprogramowania", fontSize: 12, fontWeight: 400, color: "#334155", lineHeight: 1.55, textAlign: "left" }),
    ],
  },

  {
    id: "tpl-minimal-quote",
    name: "Minimalistyczny cytat",
    category: "Document",
    preview: { background: "#ffffff" },
    elements: (w, h) => [
      bg({ fill: "#ffffff", width: w, height: h }),
      // Giant quote mark
      txt({ x: w * 0.05, y: h * 0.05, width: w * 0.4, height: 300, text: "\u201E", fontFamily: "Georgia", fontSize: 400, fontWeight: 700, color: "#e2e8f0", lineHeight: 1, textAlign: "left" }),
      // Quote
      txt({ x: w * 0.1, y: h * 0.4, width: w * 0.8, height: 150, text: "Mniej znaczy więcej.", fontFamily: "Georgia", fontSize: 64, fontWeight: 400, fontStyle: "italic", color: "#0f172a", letterSpacing: -1 }),
      // Divider
      shp({ type: "line", x: w * 0.4, y: h * 0.65, width: w * 0.2, height: 2, fill: "#0f172a" }),
      // Author
      txt({ x: w * 0.1, y: h * 0.7, width: w * 0.8, height: 30, text: "LUDWIG MIES VAN DER ROHE", fontSize: 16, fontWeight: 600, color: "#64748b", letterSpacing: 5 }),
      // Years
      txt({ x: w * 0.1, y: h * 0.75, width: w * 0.8, height: 25, text: "Architekt, 1886 — 1969", fontFamily: "Georgia", fontSize: 14, fontWeight: 400, fontStyle: "italic", color: "#94a3b8" }),
    ],
  },

  // ============= PRINT =============

  {
    id: "tpl-poster-movie",
    name: "Plakat filmowy",
    category: "Print",
    preview: { background: "#000000" },
    elements: (w, h) => [
      bg({ fill: "#000000", width: w, height: h }),
      // Red triangle
      shp({ type: "polygon", x: w * 0.15, y: h * 0.1, width: w * 0.7, height: h * 0.45, fill: "#dc2626", sides: 3, opacity: 0.9 }),
      // Bottom gradient
      shp({ type: "rectangle", x: 0, y: h * 0.5, width: w, height: h * 0.5, fill: "#000000", gradient: { from: "transparent", to: "#000000", angle: 90 } }),
      // Title
      txt({ x: w * 0.05, y: h * 0.4, width: w * 0.9, height: 350, text: "CZERWONA\nSTREFA", fontFamily: "Impact", fontSize: 220, fontWeight: 900, color: "#ffffff", lineHeight: 0.85, letterSpacing: -6, shadow: "0 0 80px rgba(220,38,38,0.8)" }),
      // Tagline
      txt({ x: w * 0.05, y: h * 0.72, width: w * 0.9, height: 60, text: "Kiedy prawo milczy,\nzaczyna się akcja", fontFamily: "Georgia", fontSize: 28, fontWeight: 400, fontStyle: "italic", color: "#fef3c7", letterSpacing: 1 }),
      // Release
      txt({ x: w * 0.05, y: h * 0.88, width: w * 0.9, height: 30, text: "W KINACH OD 25 GRUDNIA", fontSize: 20, fontWeight: 700, color: "#dc2626", letterSpacing: 5 }),
    ],
  },

  {
    id: "tpl-business-card",
    name: "Wizytówka",
    category: "Print",
    preview: { background: "#ffffff" },
    elements: (w, h) => [
      bg({ fill: "#ffffff", width: w, height: h }),
      // Top stripe
      shp({ type: "rectangle", x: 0, y: 0, width: w, height: 12, fill: "#0f172a" }),
      // Bottom accent
      shp({ type: "rectangle", x: 0, y: h - 12, width: w, height: 12, fill: "#6366f1" }),
      // Name
      txt({ x: 60, y: 100, width: w - 120, height: 70, text: "Jan Kowalski", fontFamily: "Georgia", fontSize: 52, fontWeight: 700, color: "#0f172a", lineHeight: 1, letterSpacing: -1, textAlign: "left" }),
      // Title
      txt({ x: 60, y: 175, width: w - 120, height: 30, text: "Senior Frontend Developer", fontSize: 22, fontWeight: 400, color: "#64748b", letterSpacing: 1, textAlign: "left" }),
      // Divider
      shp({ type: "line", x: 60, y: 230, width: w * 0.3, height: 2, fill: "#6366f1" }),
      // Contact
      txt({ x: 60, y: h - 130, width: w - 120, height: 30, text: "jan@kejmilfy.com  •  +48 600 100 200", fontSize: 16, fontWeight: 500, color: "#0f172a", textAlign: "left" }),
      txt({ x: 60, y: h - 95, width: w - 120, height: 30, text: "kejmilfy.com", fontSize: 16, fontWeight: 400, fontStyle: "italic", color: "#6366f1", fontFamily: "Georgia", textAlign: "left" }),
    ],
  },

  {
    id: "tpl-flyer-event",
    name: "Flyer na event",
    category: "Print",
    preview: { background: "#6366f1" },
    elements: (w, h) => [
      bg({ fill: "#6366f1", gradient: { from: "#6366f1", to: "#8b5cf6", angle: 180 }, width: w, height: h }),
      // Decorative circles
      shp({ type: "ellipse", x: w * 0.7, y: -h * 0.1, width: w * 0.5, height: w * 0.5, fill: "#ffffff", opacity: 0.1 }),
      shp({ type: "ellipse", x: -w * 0.2, y: h * 0.7, width: w * 0.6, height: w * 0.6, fill: "#ec4899", opacity: 0.2 }),
      // Date badge
      shp({ type: "rectangle", x: w * 0.35, y: h * 0.08, width: w * 0.3, height: 90, fill: "#ffffff", radius: 12 }),
      txt({ x: w * 0.35, y: h * 0.1, width: w * 0.3, height: 30, text: "LIPCA", fontSize: 18, fontWeight: 600, color: "#6366f1", letterSpacing: 3 }),
      txt({ x: w * 0.35, y: h * 0.13, width: w * 0.3, height: 60, text: "15", fontSize: 56, fontWeight: 900, color: "#0f172a", lineHeight: 1 }),
      // Title
      txt({ x: w * 0.05, y: h * 0.25, width: w * 0.9, height: 200, text: "Tech\nConference\n2026", fontFamily: "Impact", fontSize: 130, fontWeight: 900, color: "#ffffff", lineHeight: 0.9, letterSpacing: -3 }),
      // Description
      txt({ x: w * 0.1, y: h * 0.55, width: w * 0.8, height: 80, text: "Największe wydarzenie technologiczne roku — 50+ prelegentów, warsztaty, networking.", fontFamily: "Georgia", fontSize: 24, fontWeight: 400, fontStyle: "italic", color: "#ffffff", lineHeight: 1.3 }),
      // Time & place
      shp({ type: "line", x: w * 0.2, y: h * 0.72, width: w * 0.6, height: 2, fill: "#ffffff", opacity: 0.5 }),
      txt({ x: w * 0.1, y: h * 0.78, width: w * 0.8, height: 30, text: "GODZ. 9:00 — 18:00", fontSize: 22, fontWeight: 600, color: "#ffffff", letterSpacing: 3 }),
      txt({ x: w * 0.1, y: h * 0.84, width: w * 0.8, height: 30, text: "EXPO XXI  •  Warszawa", fontSize: 22, fontWeight: 600, color: "#ffffff", letterSpacing: 2 }),
      // CTA
      txt({ x: w * 0.1, y: h * 0.92, width: w * 0.8, height: 30, text: "kejmilfy.com/event", fontSize: 18, fontWeight: 400, fontStyle: "italic", color: "#fef3c7", fontFamily: "Georgia" }),
    ],
  },

  // ============= OTHER =============

  {
    id: "tpl-banner-cta",
    name: "Banner z CTA",
    category: "Other",
    preview: { background: "#06b6d4" },
    elements: (w, h) => [
      bg({ fill: "#06b6d4", gradient: { from: "#6366f1", to: "#06b6d4", angle: 135 }, width: w, height: h }),
      // Decorative
      shp({ type: "ellipse", x: w * 0.6, y: -h * 0.5, width: h * 2, height: h * 2, fill: "#ffffff", opacity: 0.1 }),
      shp({ type: "ellipse", x: w * 0.85, y: h * 0.3, width: h * 0.8, height: h * 0.8, fill: "#ffffff", opacity: 0.08 }),
      // Label
      txt({ x: w * 0.05, y: h * 0.2, width: w * 0.5, height: 40, text: "NOWOŚĆ 2026", fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: 5, textAlign: "left" }),
      // Title
      txt({ x: w * 0.05, y: h * 0.3, width: w * 0.55, height: h * 0.4, text: "Twórz\nprojekty,\nktóre\nfascynują", fontFamily: "Inter", fontSize: 76, fontWeight: 900, color: "#ffffff", lineHeight: 0.95, letterSpacing: -2, textAlign: "left", shadow: "0 4px 30px rgba(0,0,0,0.2)" }),
      // CTA button
      shp({ type: "rectangle", x: w * 0.05, y: h * 0.78, width: 280, height: 64, fill: "#ffffff", radius: 32 }),
      txt({ x: w * 0.05, y: h * 0.78, width: 280, height: 64, text: "Zacznij za darmo →", fontSize: 20, fontWeight: 700, color: "#6366f1", lineHeight: 3.2 }),
    ],
  },

  {
    id: "tpl-thank-you",
    name: "Podziękowanie",
    category: "Other",
    preview: { background: "#ec4899" },
    elements: (w, h) => [
      bg({ fill: "#ec4899", gradient: { from: "#ec4899", to: "#8b5cf6", angle: 135 }, width: w, height: h }),
      // Big circle
      shp({ type: "ellipse", x: w * 0.1, y: h * 0.1, width: w * 0.8, height: w * 0.8, fill: "#ffffff", opacity: 0.15 }),
      shp({ type: "ellipse", x: w * 0.2, y: h * 0.2, width: w * 0.6, height: w * 0.6, fill: "#ffffff", opacity: 0.1 }),
      // Title
      txt({ x: w * 0.1, y: h * 0.25, width: w * 0.8, height: 120, text: "Dziękujemy!", fontFamily: "Georgia", fontSize: 100, fontWeight: 700, fontStyle: "italic", color: "#ffffff", lineHeight: 1, letterSpacing: -2, shadow: "0 4px 30px rgba(0,0,0,0.2)" }),
      // Divider
      shp({ type: "line", x: w * 0.35, y: h * 0.42, width: w * 0.3, height: 2, fill: "#ffffff" }),
      // Body
      txt({ x: w * 0.1, y: h * 0.5, width: w * 0.8, height: 80, text: "Za 1000+ projektów\nstworzonych w kejmilfy", fontFamily: "Georgia", fontSize: 32, fontWeight: 400, color: "#ffffff", lineHeight: 1.3 }),
      // Footer
      txt({ x: w * 0.1, y: h * 0.85, width: w * 0.8, height: 40, text: "kejmilfy.app", fontSize: 22, fontWeight: 600, color: "#ffffff", letterSpacing: 3 }),
    ],
  },

  {
    id: "tpl-empty",
    name: "Puste płótno",
    category: "Other",
    preview: { background: "#ffffff" },
    elements: (w, h) => [
      bg({ fill: "#ffffff", width: w, height: h }),
    ],
  },
];
