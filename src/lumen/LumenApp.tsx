import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/icon";
import LumenTopBar from "./LumenTopBar";
import LivePreview from "./LivePreview";
import ChatPanel, { ChatMode } from "./ChatPanel";
import SettingsDrawer from "./SettingsDrawer";
import LumenLoginPage from "./LumenLoginPage";
import HomePage from "./HomePage";
import BottomNav, { Tab } from "./BottomNav";
import AntWorker from "./AntWorker";
import { useLumenAuth } from "./useLumenAuth";
import { useGitHub } from "./useGitHub";
import { useMuraveyBalance } from "./useMuraveyBalance";
import PaywallModal from "./PaywallModal";

type CycleStatus = "idle" | "reading" | "generating" | "done" | "error";
type MobileTab = "chat" | "preview";

export interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  html?: string; // HTML-ÑÐµÐ·ÑÐ»ÑÑÐ°Ñ, ÐºÐ¾ÑÐ¾ÑÑÐ¹ Ð¼Ð¾Ð¶Ð½Ð¾ Ð·Ð°Ð´ÐµÐ¿Ð»Ð¾Ð¸ÑÑ
}

interface Settings {
  apiKey: string;
  provider: "openai" | "claude";
  model: string;
  baseUrl: string;
  proxyUrl: string;
  customPrompt?: string;
}

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  provider: "openai",
  model: "gpt-4o-mini",
  baseUrl: import.meta.env.VITE_DEFAULT_OPENAI_BASE || "https://api.proxyapi.ru/openai/v1",
  proxyUrl: "",
  customPrompt: "",
};


const PROJECT_STRUCTURE = `
## Project file structure:
/src/                        â React/Vite frontend (TypeScript + Tailwind CSS)
  /src/lumen/                â AI assistant core (ChatPanel, LumenApp, LivePreview, SettingsDrawer, useGitHub.ts)
  /src/components/ui/        â shadcn/ui components (Button, Dialog, Drawer, etc.)
  /src/index.css             â global CSS variables and base styles
  /src/App.tsx               â application entry point
/backend/                    â Python 3.11 Cloud Functions (deployed serverless)
  /backend/lumen-proxy/      â OpenAI/Claude API proxy with streaming support
  /backend/generate-image/   â image generation via Pollinations + S3 CDN
  /backend/github-download/  â GitHub repo ZIP download proxy (Engine Sync)
  /backend/auth/             â authentication service
/db_migrations/              â PostgreSQL migrations (Flyway format: V{n}__{name}.sql)
/public/                     â static assets
package.json, vite.config.ts, tailwind.config.ts â project config
`;

// ââ Senior Developer Base Role ââââââââââââââââââââââââââââââââââââââââââââââ
const SENIOR_DEV_ROLE = `You are a Senior Fullstack Developer with 10+ years of experience.
Core stack: HTML/CSS/JS, React, TypeScript, Python 3.11, PostgreSQL/MySQL, REST APIs, clean architecture.

## Standards you ALWAYS follow:
- Write production-quality, clean, maintainable code â no stubs, no placeholders
- Semantic HTML, accessible markup (aria-labels), mobile-first responsive design
- Before writing code for complex systems â output a brief architecture plan (DB schema + frontend structure)
- Optimize performance: minimal DOM, efficient CSS, no layout thrashing
- When editing â preserve existing architecture, change ONLY what was asked
- Output ONLY the requested artifact â no explanations, no markdown wrappers unless it IS markdown
- Respond in the same language the user writes in (Russian if user writes in Russian)

## Built-in integrations knowledge:
- **Ð®Kassa**: REST API (https://yookassa.ru/developers), payment_id flow, webhooks, idempotence_key
- **Robokassa**: MD5 signature, ResultURL/SuccessURL callbacks, receipt format
- **Ð¡ÐÐ­Ð API v2**: OAuth2 token, /orders POST, tariff codes (136=door2door, 137=door2pickup), /calculator/tarifflist
- **Telegram Bot API**: sendMessage, inline keyboards, webhook vs polling, parse_mode=HTML
- **MySQL**: CREATE TABLE, ALTER TABLE, INDEX â always use utf8mb4, ENGINE=InnoDB; TINYINT(1) for bool
- **PostgreSQL**: standard DDL, serial/bigserial, IF NOT EXISTS, full-text search

## Architecture thinking:
When user asks for a complex feature â FIRST output a short plan:
\`\`\`
[ÐÑÑÐ¸ÑÐµÐºÑÑÑÐ°]
ÐÐ: ÑÐ°Ð±Ð»Ð¸ÑÑ + ÐºÐ»ÑÑÐµÐ²ÑÐµ Ð¿Ð¾Ð»Ñ
Ð¤ÑÐ¾Ð½Ñ: ÐºÐ¾Ð¼Ð¿Ð¾Ð½ÐµÐ½ÑÑ + flow
API: ÑÐ½Ð´Ð¿Ð¾Ð¸Ð½ÑÑ
\`\`\`
Then implement.
${PROJECT_STRUCTURE}`;

const CREATE_SYSTEM_PROMPT = `${SENIOR_DEV_ROLE}
## Task: Create a STUNNING, professional-grade website
Output ONLY a full standalone HTML document (<!DOCTYPE html>...</html>). No explanations, no markdown fences.

## DESIGN QUALITY â THIS IS YOUR TOP PRIORITY:
- Create websites worthy of Awwwards, Dribbble, Behance â NEVER generic templates
- Bold, expressive typography: large hero headings (text-6xl/7xl+), clear hierarchy
- Rich color palette: use gradients, soft shadows, and accent colors â NEVER plain white/gray defaults
- CSS animations: fade-in on scroll (Intersection Observer), smooth hover transitions, subtle parallax
- Cards with depth: border-radius, box-shadow, hover lift effects (transform: translateY(-4px))
- Glassmorphism where fitting: backdrop-filter: blur(), semi-transparent backgrounds
- Micro-interactions: button hover, nav link underlines, icon rotations

## MANDATORY SITE STRUCTURE (all sections, every time):
1. **Navigation** â sticky, logo + menu links + CTA button, blur backdrop
2. **Hero** â full-screen or tall, punchy headline, subheadline, 2 CTA buttons, background visual (gradient/image/pattern)
3. **Social proof** â logos or numbers (e.g., "500+ clients", "10 years on market", "98% satisfaction")
4. **Features/Services** â 3-6 cards with Lucide icons, title, description
5. **About / How it works** â with steps or story
6. **Portfolio / Cases** â if applicable (grid of cards with hover overlay)
7. **Testimonials** â 2-3 cards with name, role, avatar (colored initials circle), quote
8. **FAQ** â accordion, 4-6 questions
9. **CTA Section** â bold background, compelling headline, form or button
10. **Footer** â logo, nav links, contacts, social icons, copyright

## Technical requirements:
- Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Lucide icons via CDN: <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
- Google Fonts via CDN â always pick 1-2 premium fonts matching the brand tone
- All JS inline in <script> tags. Fully responsive mobile-first
- Scroll animations: use IntersectionObserver to fade-in sections on scroll
- IMAGES: Use provided URLs directly. For placeholders use gradient backgrounds, NOT external image services
- For forms/payments â skeleton with clear comments for Ð®Kassa/Robokassa/Ð¡ÐÐ­Ð integration
- Write REAL persuasive copy â not "Lorem ipsum" or generic placeholders. Make it specific and compelling.`;

const EDIT_SYSTEM_PROMPT_FULL = (currentHtml: string) =>
  `${SENIOR_DEV_ROLE}
## Task: Edit existing website code
Output ONLY the complete modified HTML document. No explanations, no markdown.
Rules:
- Make EXACTLY the requested changes, nothing more
- Preserve all existing styles, structure, content that was NOT mentioned
- Keep the same framework/library versions already in the code

--- CURRENT SITE CODE ---
${currentHtml}
--- END OF CODE ---`;

const ZIP_CONVERT_SYSTEM_PROMPT = `${SENIOR_DEV_ROLE}
## Task: Convert React/Vite project to single HTML file
Your ONLY goal is to faithfully recreate the existing site as one self-contained HTML file.
Strict rules:
1. Output ONLY the complete HTML document (<!DOCTYPE html>...) â no explanations, no markdown
2. DO NOT invent new design or copy â reproduce EXACTLY what's in the source files
3. Preserve all text, headings, color scheme, fonts, spacing from the original
4. Load via CDN: Tailwind CSS, Lucide icons, Google Fonts (if used in source)
5. All JS inline in <script> tags. Fully responsive.`;

const LOCAL_FILE_EDIT_PROMPT = (currentHtml: string, fileName: string) =>
  `${SENIOR_DEV_ROLE}
## Task: Edit uploaded file Â«${fileName}Â»
Output ONLY the complete modified HTML document. No explanations, no markdown.
Make EXACTLY the requested changes â preserve everything else as-is.

--- CURRENT FILE CODE ---
${currentHtml}
--- END OF CODE ---`;

// ââ SQL migration prompt ââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SQL_MIGRATION_SYSTEM_PROMPT = `${SENIOR_DEV_ROLE}
## Task: Generate SQL migration
Output a JSON object with two fields:
- "sql": complete SQL script (PostgreSQL + MySQL compatible where possible)
- "explanation": brief description in Russian (1-3 sentences)
Rules: USE IF NOT EXISTS, add comments, use VARCHAR over TEXT for MySQL compat, TINYINT(1) for bool.
Output ONLY valid JSON, no markdown fences.`;

// ââ Self-Edit Mode Ð¿ÑÐ¾Ð¼Ð¿Ñ â ÐÐ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÑÐµÑ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ ÑÐµÑÐµÐ· GitHub ââââââââââ
const SELF_EDIT_SYSTEM_PROMPT = (repo: string, branch: string) =>
  `${SENIOR_DEV_ROLE}
## Self-Edit Mode â ACTIVE
You have READ and WRITE access to the ÐÑÑÐ°Ð²ÐµÐ¹ (Ant) platform source code via GitHub API.
Engine Repository: ${repo} (branch: ${branch})

To list files in a directory:
\`\`\`action
{"action":"list","path":"src/lumen"}
\`\`\`

To read ONE file:
\`\`\`action
{"action":"read","path":"src/lumen/LumenApp.tsx"}
\`\`\`

To read MULTIPLE files at once:
\`\`\`action
{"action":"read_multiple","paths":["src/lumen/LumenApp.tsx","src/lumen/ChatPanel.tsx"]}
\`\`\`

To write/modify a file:
\`\`\`action
{"action":"write","path":"src/lumen/SomeFile.tsx","content":"...full file content..."}
\`\`\`

Workflow:
1. Use list to explore directories
2. Use read_multiple to read several files at once (faster!)
3. Plan minimal changes
4. WRITE complete updated file content
5. Confirm changes

Rules:
- Always read before writing
- Prefer read_multiple over multiple single reads
- Write the COMPLETE file content, not just changed parts
- Respond in Russian to the user, keep code in English`;



let msgCounter = 0;

export default function LumenApp() {
  const { loggedIn, authed, login, adminLogin, logout } = useLumenAuth();
  const { ghSettings, saveGhSettings, fetchFromGitHub, pushToGitHub, syncEngine } = useGitHub();

  // ÐÐ°Ð»Ð°Ð½Ñ Ð·Ð°Ð¿ÑÐ¾ÑÐ¾Ð² (ÑÐ¾Ð»ÑÐºÐ¾ Ð´Ð»Ñ Ð¾Ð±ÑÑÐ½ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÐµÐ¹)
  const {
    balance: muraveyBalance,
    spendRequest,
    createPayment,
    checkPayment,
    confirmTestPayment,
    restoreByEmail,
    fetchBalance,
  } = useMuraveyBalance(authed);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const liveUrl = (() => {
    if (ghSettings.siteUrl?.trim()) {
      const u = ghSettings.siteUrl.trim();
      return u.endsWith("/") ? u : u + "/";
    }
    const [user, repo] = (ghSettings.repo || "").split("/");
    return user && repo ? `https://${user}.github.io/${repo}/` : "";
  })();

  const [cycleStatus, setCycleStatus] = useState<CycleStatus>("idle");
  const [cycleLabel, setCycleLabel] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [deployingId, setDeployingId] = useState<number | null>(null);
  const [deployResult, setDeployResult] = useState<{ id: number; ok: boolean; message: string } | null>(null);
  const [currentFileSha, setCurrentFileSha] = useState<string>("");
  const [currentFilePath, setCurrentFilePath] = useState<string>("");
  const [loadingFromGitHub, setLoadingFromGitHub] = useState(false);
  const [fullCodeContext, setFullCodeContext] = useState<{ html: string; fileName: string } | null>(null);
  const [showRebuildBanner, setShowRebuildBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bottom navigation
  const [activeTab, setActiveTab] = useState<Tab>("home");

  // Self-Edit Mode
  const [selfEditMode, setSelfEditMode] = useState<boolean>(() => {
    try { return localStorage.getItem("lumen_self_edit") === "1"; } catch { return false; }
  });

  // ÐÑÐ±Ð»Ð¸ÑÐ½ÑÐ¹ ÐÐ-ÑÐµÐ¶Ð¸Ð¼ â ÑÐ°Ð·ÑÐµÑÐ°ÐµÑ Ð²ÑÐµÐ¼ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÑÐ¼ Ð¸ÑÐ¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÑ ÑÐ°Ñ
  const [publicAiEnabled, setPublicAiEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem("lumen_public_ai") === "1"; } catch { return false; }
  });
  const handlePublicAiToggle = (v: boolean) => {
    setPublicAiEnabled(v);
    try { localStorage.setItem("lumen_public_ai", v ? "1" : "0"); } catch (_e) { /* ignore */ }
  };
  const handleSelfEditToggle = (v: boolean) => {
    setSelfEditMode(v);
    try { localStorage.setItem("lumen_self_edit", v ? "1" : "0"); } catch { /* ignore */ }
    setMessages(prev => [...prev, {
      id: ++msgCounter, role: "assistant",
      text: v
        ? "Self-Edit Mode Ð²ÐºÐ»ÑÑÑÐ½. Ð¢ÐµÐ¿ÐµÑÑ Ñ Ð¼Ð¾Ð³Ñ ÑÐ¸ÑÐ°ÑÑ Ð¸ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°ÑÑ ÑÐ°Ð¹Ð»Ñ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ ÑÐµÑÐµÐ· Engine GitHub. Ð¡ÐºÐ°Ð¶Ð¸ ÑÑÐ¾ Ð½ÑÐ¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ."
        : "Self-Edit Mode Ð²ÑÐºÐ»ÑÑÐµÐ½. Ð Ð°Ð±Ð¾ÑÐ°Ñ Ð² Ð¾Ð±ÑÑÐ½Ð¾Ð¼ ÑÐµÐ¶Ð¸Ð¼Ðµ.",
    }]);
  };

  // Sync Engine â ÑÐºÐ°ÑÐ°ÑÑ Ð¸ÑÑÐ¾Ð´Ð½Ð¸ÐºÐ¸ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ
  const [syncingEngine, setSyncingEngine] = useState(false);
  const handleSyncEngine = useCallback(async () => {
    setSyncingEngine(true);
    setCycleStatus("reading");
    setCycleLabel("Ð¡Ð¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð¸ÑÑÑ Engine...");
    try {
      const result = await syncEngine((msg) => setCycleLabel(msg));
      setCycleStatus(result.ok ? "done" : "error");
      setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: result.message }]);
    } catch (err) {
      setCycleStatus("error");
      setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ° Sync Engine: ${err instanceof Error ? err.message : String(err)}` }]);
    } finally {
      setSyncingEngine(false);
    }
  }, [syncEngine]);

  // Ð¡Ð¾ÑÑÐ°Ð½ÑÐµÐ¼ HTML Ð² localStorage Ð¿ÑÐ¸ ÐºÐ°Ð¶Ð´Ð¾Ð¼ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¸
  const savePreviewHtml = (html: string | null) => {
    setPreviewHtml(prev => {
      if (prev) setHtmlHistory(h => [...h.slice(-9), prev]); // ÑÑÐ°Ð½Ð¸Ð¼ Ð´Ð¾ 10 Ð²ÐµÑÑÐ¸Ð¹
      return html;
    });
    try {
      if (html) localStorage.setItem("lumen_last_html", html);
      else localStorage.removeItem("lumen_last_html");
    } catch { /* ignore */ }
  };

  const handleUndo = () => {
    setHtmlHistory(h => {
      const prev = h[h.length - 1];
      if (!prev) return h;
      setPreviewHtml(prev);
      try { localStorage.setItem("lumen_last_html", prev); } catch { /* ignore */ }
      return h.slice(0, -1);
    });
  };

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("lumen_settings");
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const abortRef = useRef(false);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [convertingZip, setConvertingZip] = useState(false);

  // ÐÐ°Ð³ÑÑÐ¶Ð°ÐµÐ¼ JSZip ÑÐµÑÐµÐ· CDN Ð¾Ð´Ð¸Ð½ ÑÐ°Ð·
  useEffect(() => {
    if (!(window as unknown as Record<string, unknown>).JSZip) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      document.head.appendChild(script);
    }
  }, []);

  // Ð§Ð¸ÑÐ°ÐµÐ¼ ZIP Ð¸ Ð¾ÑÐ´Ð°ÑÐ¼ Ð²ÑÐµ ÑÐµÐºÑÑÐ¾Ð²ÑÐµ ÑÐ°Ð¹Ð»Ñ
  const readZipFiles = async (file: File): Promise<Record<string, string>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZip = (window as any).JSZip;
    if (!JSZip) throw new Error("JSZip ÐµÑÑ Ð½Ðµ Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½, Ð¿Ð¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÐµÑÑ ÑÐ°Ð·");
    const zip = await JSZip.loadAsync(file);
    const result: Record<string, string> = {};
    const textExts = [".tsx", ".ts", ".jsx", ".js", ".css", ".html", ".json", ".md", ".svg"];
    const skipDirs = ["node_modules", ".git", "dist", "build", ".next"];

    const promises: Promise<void>[] = [];
    zip.forEach((relativePath: string, zipEntry: { dir: boolean; async: (type: string) => Promise<string> }) => {
      if (zipEntry.dir) return;
      const skip = skipDirs.some(d => relativePath.includes(`${d}/`));
      if (skip) return;
      const ext = relativePath.slice(relativePath.lastIndexOf(".")).toLowerCase();
      if (!textExts.includes(ext)) return;
      promises.push(
        zipEntry.async("string").then(content => {
          result[relativePath] = content;
        })
      );
    });
    await Promise.all(promises);
    return result;
  };

  const handleLoadZip = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setConvertingZip(true);
    setCycleStatus("reading");
    setCycleLabel("Ð§Ð¸ÑÐ°Ñ Ð°ÑÑÐ¸Ð²...");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const JSZip = (window as any).JSZip;
      if (!JSZip) throw new Error("JSZip ÐµÑÑ Ð½Ðµ Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½, Ð¿Ð¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÐµÑÑ ÑÐ°Ð·");
      const zip = await JSZip.loadAsync(file);

      // Ð¡Ð¾Ð±Ð¸ÑÐ°ÐµÐ¼ Ð²ÑÐµ Ð¿ÑÑÐ¸ Ð² Ð°ÑÑÐ¸Ð²Ðµ Ð´Ð»Ñ Ð´Ð¸Ð°Ð³Ð½Ð¾ÑÑÐ¸ÐºÐ¸
      const allPaths: string[] = [];
      zip.forEach((relativePath: string, zipEntry: { dir: boolean }) => {
        if (!zipEntry.dir) allPaths.push(relativePath);
      });
      console.log("[ZIP] ÐÑÐµ ÑÐ°Ð¹Ð»Ñ Ð² Ð°ÑÑÐ¸Ð²Ðµ:", allPaths);

      // ÐÑÐµÐ¼ Ð³Ð¾ÑÐ¾Ð²ÑÐ¹ index.html â ÑÐ½Ð°ÑÐ°Ð»Ð° ÑÐ¾ÑÐ½ÑÐµ Ð¿ÑÑÐ¸, Ð¿Ð¾ÑÐ¾Ð¼ Ð»ÑÐ±Ð¾Ð¹ index.html
      let foundHtml = "";
      let foundPath = "";

      // Ð¢Ð¾ÑÐ½ÑÐµ ÐºÐ°Ð½Ð´Ð¸Ð´Ð°ÑÑ
      const candidates = ["dist/index.html", "build/index.html", "index.html"];
      for (const candidate of candidates) {
        const entry = zip.file(candidate);
        if (entry) {
          foundHtml = await entry.async("string");
          foundPath = candidate;
          break;
        }
      }

      // ÐÑÐ±Ð¾Ð¹ index.html Ð² Ð»ÑÐ±Ð¾Ð¹ Ð²Ð»Ð¾Ð¶ÐµÐ½Ð½Ð¾Ð¹ Ð¿Ð°Ð¿ÐºÐµ
      if (!foundHtml) {
        // ÐÑÐ¸Ð¾ÑÐ¸ÑÐµÑ: dist > build > ÐºÐ¾ÑÐµÐ½Ñ > Ð¾ÑÑÐ°Ð»ÑÐ½Ð¾Ðµ
        const htmlFiles = allPaths.filter(p => p.endsWith("index.html"));
        console.log("[ZIP] ÐÐ°Ð¹Ð´ÐµÐ½Ñ index.html:", htmlFiles);
        const pick = htmlFiles.find(p => p.includes("dist/")) 
          || htmlFiles.find(p => p.includes("build/"))
          || htmlFiles[0];
        if (pick) {
          foundPath = pick;
          foundHtml = await zip.file(pick)!.async("string");
        }
      }

      console.log("[ZIP] ÐÑÐ±ÑÐ°Ð½ ÑÐ°Ð¹Ð»:", foundPath, "| Ð´Ð»Ð¸Ð½Ð° HTML:", foundHtml.length);

      if (foundHtml) {
        // ÐÐ½Ð»Ð°Ð¹Ð½Ð¸Ð¼ Ð²ÑÐµ .css Ð¸ .js Ð¸Ð· Ð°ÑÑÐ¸Ð²Ð° Ð¿ÑÑÐ¼Ð¾ Ð² HTML (Ð±ÐµÐ· AI)
        setCycleLabel("ÐÑÑÑÐ°Ð¸Ð²Ð°Ñ ÑÑÐ¸Ð»Ð¸ Ð¸ ÑÐºÑÐ¸Ð¿ÑÑ...");
        const baseDir = foundPath.includes("/") ? foundPath.slice(0, foundPath.lastIndexOf("/") + 1) : "";

        // Ð¡Ð¾Ð±Ð¸ÑÐ°ÐµÐ¼ Ð²ÑÐµ ÑÐµÐºÑÑÐ¾Ð²ÑÐµ ÑÐ°Ð¹Ð»Ñ Ð¸Ð· Ð°ÑÑÐ¸Ð²Ð°
        const zipAssets: Record<string, string> = {};
        const assetPromises: Promise<void>[] = [];
        zip.forEach((relPath: string, entry: { dir: boolean; async: (t: string) => Promise<string> }) => {
          if (entry.dir) return;
          const ext = relPath.slice(relPath.lastIndexOf(".")).toLowerCase();
          if ([".css", ".js"].includes(ext)) {
            assetPromises.push(entry.async("string").then(c => { zipAssets[relPath] = c; }));
          }
        });
        await Promise.all(assetPromises);
        console.log("[ZIP] Assets Ð½Ð°Ð¹Ð´ÐµÐ½Ð¾:", Object.keys(zipAssets));

        // ÐÐ°Ð¼ÐµÐ½ÑÐµÐ¼ <link rel="stylesheet" href="..."> Ð½Ð° Ð¸Ð½Ð»Ð°Ð¹Ð½ <style>
        let inlinedHtml = foundHtml.replace(/<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi, (match, href) => {
          const normalized = href.startsWith("/") ? href.slice(1) : href;
          const key = zipAssets[baseDir + normalized] !== undefined ? baseDir + normalized
            : zipAssets[normalized] !== undefined ? normalized
            : Object.keys(zipAssets).find(k => k.endsWith(normalized.replace(/^.*\//, "")));
          if (key && zipAssets[key]) {
            console.log("[ZIP] ÐÐ½Ð»Ð°Ð¹Ð½ CSS:", key);
            return `<style>${zipAssets[key]}</style>`;
          }
          return match;
        });

        // ÐÐ°Ð¼ÐµÐ½ÑÐµÐ¼ <script src="..."> Ð½Ð° Ð¸Ð½Ð»Ð°Ð¹Ð½ <script>
        inlinedHtml = inlinedHtml.replace(/<script([^>]+)src=["']([^"']+)["']([^>]*)><\/script>/gi, (match, pre, src, post) => {
          const normalized = src.startsWith("/") ? src.slice(1) : src;
          const key = zipAssets[baseDir + normalized] !== undefined ? baseDir + normalized
            : zipAssets[normalized] !== undefined ? normalized
            : Object.keys(zipAssets).find(k => k.endsWith(normalized.replace(/^.*\//, "")));
          if (key && zipAssets[key]) {
            console.log("[ZIP] ÐÐ½Ð»Ð°Ð¹Ð½ JS:", key);
            const attrs = (pre + post).replace(/\s*src=["'][^"']*["']/gi, "").replace(/\s*type=["']module["']/gi, "");
            return `<script${attrs}>${zipAssets[key]}</script>`;
          }
          return match;
        });

        const htmlWithBase = liveUrl ? injectBaseHref(inlinedHtml, liveUrl) : inlinedHtml;
        savePreviewHtml(injectLightTheme(htmlWithBase));
        setFullCodeContext({ html: inlinedHtml, fileName: foundPath });
        setMobileTab("preview");
        setCycleStatus("done");
        setCycleLabel("");
        setMessages(prev => [...prev, {
          id: ++msgCounter,
          role: "assistant",
          text: `ÐÐ°Ð³ÑÑÐ¶ÐµÐ½ Â«${foundPath}Â» Ð¸Ð· Ð°ÑÑÐ¸Ð²Ð°. ÐÐ¿Ð¸ÑÐ¸ÑÐµ ÑÑÐ¾ Ð½ÑÐ¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ â Ð¾ÑÑÐµÐ´Ð°ÐºÑÐ¸ÑÑÑ.`,
        }]);
      } else {
        // ÐÐ¾ÑÐ¾Ð²Ð¾Ð³Ð¾ HTML Ð½ÐµÑ â ÐºÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÑÐµÐ¼ ÑÐµÑÐµÐ· ÐÐ
        const files = await readZipFiles(file);
        const fileCount = Object.keys(files).length;
        if (fileCount === 0) throw new Error("Ð Ð°ÑÑÐ¸Ð²Ðµ Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½Ñ ÑÐ°Ð¹Ð»Ñ Ð¿ÑÐ¾ÐµÐºÑÐ°");

        const filesContext = Object.entries(files)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([path, content]) => `\n\n### Ð¤Ð°Ð¹Ð»: ${path}\n\`\`\`\n${content.slice(0, 6000)}\n\`\`\``)
          .join("");

        const zipPrompt = `ÐÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÑÐ¹ ÑÑÐ¾Ñ React/Vite Ð¿ÑÐ¾ÐµÐºÑ (${fileCount} ÑÐ°Ð¹Ð»Ð¾Ð²) Ð² Ð¾Ð´Ð¸Ð½ HTML ÑÐ°Ð¹Ð». Ð¡Ð¾ÑÑÐ°Ð½Ð¸ Ð²ÑÐµ ÑÐµÐºÑÑÑ, ÑÐ²ÐµÑÐ° Ð¸ ÑÑÑÑÐºÑÑÑÑ ÑÐ¾ÑÐ½Ð¾ ÐºÐ°Ðº Ð² Ð¾ÑÐ¸Ð³Ð¸Ð½Ð°Ð»Ðµ. ÐÐµÑÐ½Ð¸ Ð¢ÐÐÐ¬ÐÐ HTML.

--- Ð¤ÐÐÐÐ« ÐÐ ÐÐÐÐ¢Ð ---${filesContext}
--- ÐÐÐÐÐ¦ Ð¤ÐÐÐÐÐ ---`;

        setCycleLabel("ÐÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÑÑ...");
        setCycleStatus("generating");

        const rawResponse = await callAI(ZIP_CONVERT_SYSTEM_PROMPT, zipPrompt, (chars) => {
          setCycleLabel(`ÐÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÑÑ... ${chars} ÑÐ¸Ð¼Ð².`);
        });
        const cleanHtml = extractHtml(rawResponse);

        if (!/<[a-z][\s\S]*>/i.test(cleanHtml)) {
          throw new Error("ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÐºÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÐ¾Ð²Ð°ÑÑ Ð¿ÑÐ¾ÐµÐºÑ. ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÐµÑÑ ÑÐ°Ð·.");
        }

        const htmlWithBase = liveUrl ? injectBaseHref(cleanHtml, liveUrl) : cleanHtml;
        savePreviewHtml(injectLightTheme(htmlWithBase));
        setMobileTab("preview");
        setCycleStatus("done");
        setCycleLabel("");
        setMessages(prev => [...prev, {
          id: ++msgCounter,
          role: "assistant",
          text: `ÐÑÐ¾ÐµÐºÑ Â«${file.name}Â» ÐºÐ¾Ð½Ð²ÐµÑÑÐ¸ÑÐ¾Ð²Ð°Ð½ (${fileCount} ÑÐ°Ð¹Ð»Ð¾Ð²). ÐÐ¿Ð¸ÑÐ¸ÑÐµ ÑÑÐ¾ Ð½ÑÐ¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ â Ð¾ÑÑÐµÐ´Ð°ÐºÑÐ¸ÑÑÑ.`,
        }]);
      }

    } catch (err) {
      setCycleStatus("error");
      setCycleLabel("");
      const errText = err instanceof Error ? err.message : "ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°";
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ°: ${errText}` }]);
    } finally {
      setConvertingZip(false);
    }
  }, [settings, liveUrl]);

  const extractHtml = (raw: string): string => {
    const mdMatch = raw.match(/```html\s*\n([\s\S]*?)```/i) || raw.match(/```\s*\n([\s\S]*?)```/);
    if (mdMatch) raw = mdMatch[1].trim();
    const tagMatch = raw.match(/(<!DOCTYPE[\s\S]*)/i) || raw.match(/(<html[\s\S]*)/i);
    return tagMatch ? tagMatch[1].trim() : raw.trim();
  };

  // ÐÐ½Ð¶ÐµÐºÑÐ¸ÑÑÐµÑ Ð¿ÑÐ¸Ð½ÑÐ´Ð¸ÑÐµÐ»ÑÐ½ÑÐ¹ ÑÐ²ÐµÑÐ»ÑÐ¹ ÑÐ¾Ð½ ÐµÑÐ»Ð¸ Ð² HTML Ð½ÐµÑ ÑÐ²Ð½Ð¾Ð³Ð¾ ÑÐ²ÐµÑÐ»Ð¾Ð³Ð¾ background
  const injectLightTheme = (html: string): string => {
    const forceCss = `<style data-lumen-fix>
      html,body{background:#ffffff!important;color:#111111!important;}
    </style>`;
    if (/<\/head>/i.test(html)) {
      return html.replace(/<\/head>/i, `${forceCss}</head>`);
    }
    if (/<body/i.test(html)) {
      return html.replace(/<body([^>]*)>/i, `<head>${forceCss}</head><body$1>`);
    }
    return forceCss + html;
  };

  // ÐÐ½Ð¶ÐµÐºÑÐ¸ÑÑÐµÑ <base href> Ð² HTML ÑÑÐ¾Ð±Ñ Ð¾ÑÐ½Ð¾ÑÐ¸ÑÐµÐ»ÑÐ½ÑÐµ Ð¿ÑÑÐ¸ assets/ ÑÐ°Ð±Ð¾ÑÐ°Ð»Ð¸ ÑÐµÑÐµÐ· Ð¶Ð¸Ð²Ð¾Ð¹ Ð´Ð¾Ð¼ÐµÐ½
  const injectBaseHref = (html: string, baseUrl: string): string => {
    if (!baseUrl) return html;
    const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
    // ÐÑÐ»Ð¸ ÑÐ¶Ðµ ÐµÑÑÑ <base> ÑÐµÐ³ â Ð·Ð°Ð¼ÐµÐ½ÑÐµÐ¼ ÐµÐ³Ð¾
    if (/<base\s[^>]*href/i.test(html)) {
      return html.replace(/<base\s[^>]*href=["'][^"']*["'][^>]*>/i, `<base href="${base}">`);
    }
    // ÐÐ½Ð°ÑÐµ Ð²ÑÑÐ°Ð²Ð»ÑÐµÐ¼ ÑÑÐ°Ð·Ñ Ð¿Ð¾ÑÐ»Ðµ <head>
    if (/<head>/i.test(html)) {
      return html.replace(/<head>/i, `<head>\n  <base href="${base}">`);
    }
    // Fallback â Ð²ÑÑÐ°Ð²Ð»ÑÐµÐ¼ Ð¿Ð¾ÑÐ»Ðµ <html>
    if (/<html[^>]*>/i.test(html)) {
      return html.replace(/(<html[^>]*>)/i, `$1\n<head><base href="${base}"></head>`);
    }
    return html;
  };

  const buildChatHistory = (currentUserText: string, maxPairs = 8): { role: string; content: string }[] => {
    // ÐÐµÑÑÐ¼ Ð¿Ð¾ÑÐ»ÐµÐ´Ð½Ð¸Ðµ maxPairs Ð¿Ð°Ñ (user+assistant) Ð¸Ð· Ð¸ÑÑÐ¾ÑÐ¸Ð¸, Ð¸ÑÐºÐ»ÑÑÐ°Ñ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ Ð¸ Ð´Ð»Ð¸Ð½Ð½ÑÐ¹ HTML
    const history: { role: string; content: string }[] = [];
    const recent = messages.slice(-maxPairs * 2);
    for (const msg of recent) {
      if (msg.html?.startsWith("__IMAGE__:")) continue; // Ð¿ÑÐ¾Ð¿ÑÑÐºÐ°ÐµÐ¼ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸
      const content = msg.html
        ? msg.html.length > 8000 ? msg.text + "\n[Ð¿ÑÐµÐ´ÑÐ´ÑÑÐ¸Ð¹ HTML-ÐºÐ¾Ð´ ÑÐ°Ð¹ÑÐ° Ð¾Ð±ÑÐµÐ·Ð°Ð½ Ð´Ð»Ñ ÑÐºÐ¾Ð½Ð¾Ð¼Ð¸Ð¸ ÑÐ¾ÐºÐµÐ½Ð¾Ð²]" : msg.html
        : msg.text;
      history.push({ role: msg.role === "user" ? "user" : "assistant", content });
    }
    history.push({ role: "user", content: currentUserText });
    return history;
  };

  const callAI = async (systemPrompt: string, userText: string, onProgress?: (chars: number) => void, useHistory = false, timeoutMs = 120_000): Promise<string> => {
    const rawBase = (settings.baseUrl || "").trim().replace(/\/+$/, "");
    const isOpenAI = settings.provider === "openai";

    const chatMessages = useHistory
      ? buildChatHistory(userText)
      : [{ role: "user", content: userText }];

    const MODEL_MAX_TOKENS: Record<string, number> = {
      "gpt-4o-mini": 16000,
      "gpt-4o": 16000,
      "gpt-4-turbo": 16000,
      "o3-mini": 16000,
      "o1-mini": 16000,
    };
    const maxTokens = MODEL_MAX_TOKENS[settings.model] ?? 32000;

    // ÐÐ¿ÑÐµÐ´ÐµÐ»ÑÐµÐ¼ endpoint Ð¸ Ð·Ð°Ð³Ð¾Ð»Ð¾Ð²ÐºÐ¸ Ð´Ð»Ñ Ð¿ÑÑÐ¼Ð¾Ð³Ð¾ Ð²ÑÐ·Ð¾Ð²Ð° API
    const PROXYAPI_HOSTS = new Set(["proxyapi.ru", "www.proxyapi.ru", "api.proxyapi.ru"]);

    let endpoint: string;
    let reqHeaders: Record<string, string> = { "Content-Type": "application/json" };
    let requestBody: Record<string, unknown>;

    if (isOpenAI) {
      const base = rawBase || (import.meta.env.VITE_DEFAULT_OPENAI_BASE || "https://api.proxyapi.ru/openai");
      const parsedHost = base.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
      if (PROXYAPI_HOSTS.has(parsedHost)) {
        endpoint = "https://api.proxyapi.ru/openai/v1/chat/completions";
      } else if (base.endsWith("/chat/completions")) {
        endpoint = base;
      } else if (base.endsWith("/v1")) {
        endpoint = base + "/chat/completions";
      } else {
        endpoint = base + "/v1/chat/completions";
      }
      reqHeaders["Authorization"] = `Bearer ${settings.apiKey.trim()}`;
      requestBody = {
        model: settings.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        max_tokens: maxTokens,
      };
    } else {
      const base = rawBase || (import.meta.env.VITE_DEFAULT_CLAUDE_BASE || "https://api.proxyapi.ru/anthropic");
      const parsedHost = base.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
      if (PROXYAPI_HOSTS.has(parsedHost)) {
        endpoint = "https://api.proxyapi.ru/anthropic/v1/messages";
      } else if (base.endsWith("/messages")) {
        endpoint = base;
      } else if (base.endsWith("/v1")) {
        endpoint = base + "/messages";
      } else {
        endpoint = base + "/v1/messages";
      }
      reqHeaders["x-api-key"] = settings.apiKey.trim();
      reqHeaders["anthropic-version"] = "2023-06-01";
      requestBody = {
        model: settings.model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: chatMessages,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: reqHeaders,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (e) {
      clearTimeout(timeoutId);
      if ((e as Error)?.name === "AbortError") {
        throw new Error(`ÐÑÐµÐ²ÑÑÐµÐ½Ð¾ Ð²ÑÐµÐ¼Ñ Ð¾Ð¶Ð¸Ð´Ð°Ð½Ð¸Ñ (${timeoutMs / 1000} ÑÐµÐº). ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÐµÑÑ ÑÐ°Ð· Ð¸Ð»Ð¸ ÑÐ¿ÑÐ¾ÑÑÐ¸ÑÐµ Ð·Ð°Ð¿ÑÐ¾Ñ.`);
      }
      throw new Error(`Ð¡ÐµÑÐµÐ²Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°: ${String(e)}`);
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let rawText = "";
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawText += decoder.decode(value, { stream: true });
          if (onProgress) onProgress(rawText.length);
        }
      } finally {
        clearTimeout(timeoutId);
        reader.releaseLock();
      }
    } else {
      rawText = await res.text();
      clearTimeout(timeoutId);
    }

    let data: Record<string, unknown>;
    try { data = JSON.parse(rawText); } catch {
      throw new Error(`Ð¡ÐµÑÐ²ÐµÑ Ð²ÐµÑÐ½ÑÐ» Ð½Ðµ JSON (HTTP ${res.status}): ${rawText.slice(0, 300)}`);
    }

    if (!res.ok || data.error) {
      const errMsg = data.error as { message?: string } | string | undefined;
      const detail = typeof errMsg === "string" ? errMsg : errMsg?.message;
      throw new Error(`HTTP ${res.status}: ${detail || rawText.slice(0, 300)}`);
    }

    if (isOpenAI) {
      const content = (data.choices as { message: { content: string } }[])?.[0]?.message?.content ?? "";
      if (!content) throw new Error("ÐÐ Ð²ÐµÑÐ½ÑÐ» Ð¿ÑÑÑÐ¾Ð¹ Ð¾ÑÐ²ÐµÑ. ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸ Ð¼Ð¾Ð´ÐµÐ»Ð¸.");
      return content;
    } else {
      const content = (data.content as { text: string }[])?.[0]?.text ?? "";
      if (!content) throw new Error("ÐÐ Ð²ÐµÑÐ½ÑÐ» Ð¿ÑÑÑÐ¾Ð¹ Ð¾ÑÐ²ÐµÑ. ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸ Ð¼Ð¾Ð´ÐµÐ»Ð¸.");
      return content;
    }
  };

  // ÐÐµÐ½ÐµÑÐ°ÑÐ¸Ñ Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¸Ð¹ ÑÐµÑÐµÐ· pollinations.ai (Ð±ÐµÑÐ¿Ð»Ð°ÑÐ½Ð¾, Ð±ÐµÐ· API ÐºÐ»ÑÑÐ°)
  // Ð¸Ð»Ð¸ ÑÐµÑÐµÐ· ÑÐ²Ð¾Ð¹ ÑÐµÑÐ²Ð¸Ñ, ÐµÑÐ»Ð¸ Ð·Ð°Ð´Ð°Ð½ VITE_IMAGE_GENERATE_URL
  const IMAGE_GENERATE_URL = import.meta.env.VITE_IMAGE_GENERATE_URL || "";

  const handleSendImage = useCallback(async (text: string) => {
    setCycleStatus("generating");
    setCycleLabel("ÐÐµÐ½ÐµÑÐ¸ÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ...");
    try {
      let imageUrl: string;

      if (IMAGE_GENERATE_URL) {
        // ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ ÑÐ²Ð¾Ð¹ ÑÐµÑÐ²Ð¸Ñ Ð³ÐµÐ½ÐµÑÐ°ÑÐ¸Ð¸ (ÐµÑÐ»Ð¸ Ð·Ð°Ð´Ð°Ð½ VITE_IMAGE_GENERATE_URL)
        const r = await fetch(IMAGE_GENERATE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        const d = await r.json();
        if (!d.url) throw new Error(d.error || "ÐÑÐ¸Ð±ÐºÐ° Ð³ÐµÐ½ÐµÑÐ°ÑÐ¸Ð¸");
        imageUrl = d.url;
      } else {
        // Pollinations.ai â Ð±ÐµÑÐ¿Ð»Ð°ÑÐ½ÑÐ¹ ÑÐµÑÐ²Ð¸Ñ, Ð±ÐµÐ· API ÐºÐ»ÑÑÐ°
        const encodedPrompt = encodeURIComponent(text);
        imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=768&nologo=true&enhance=true`;
        // ÐÑÐ¾Ð²ÐµÑÑÐµÐ¼ Ð´Ð¾ÑÑÑÐ¿Ð½Ð¾ÑÑÑ Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¸Ñ
        const check = await fetch(imageUrl, { method: "HEAD" });
        if (!check.ok) throw new Error(`ÐÑÐ¸Ð±ÐºÐ° Ð³ÐµÐ½ÐµÑÐ°ÑÐ¸Ð¸: HTTP ${check.status}`);
      }

      setCycleStatus("done");
      setCycleLabel("");
      setMessages(prev => [...prev, {
        id: ++msgCounter,
        role: "assistant",
        text: `ÐÐ°ÑÑÐ¸Ð½ÐºÐ° Ð³Ð¾ÑÐ¾Ð²Ð°!`,
        html: `__IMAGE__:${imageUrl}`,
      }]);
    } catch (err) {
      setCycleStatus("error");
      setCycleLabel("");
      const errText = err instanceof Error ? err.message : "ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°";
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ°: ${errText}` }]);
    }
  }, [IMAGE_GENERATE_URL]);

  const readFileFromGitHub = async (path: string, token: string, repo: string, branch: string): Promise<{ content: string; error?: never } | { content?: never; error: string }> => {
    if (!repo || !token) return { error: "ÐÐµ Ð½Ð°ÑÑÑÐ¾ÐµÐ½ Engine-ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ Ð¸Ð»Ð¸ ÑÐ¾ÐºÐµÐ½. ÐÑÐºÑÐ¾Ð¹ÑÐµ ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸ â Engine GitHub." };
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`;
    let res: Response;
    try {
      res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    } catch (e) {
      return { error: `Ð¡ÐµÑÐµÐ²Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ° Ð¿ÑÐ¸ ÑÑÐµÐ½Ð¸Ð¸ ${path}: ${String(e)}` };
    }
    if (res.status === 401) return { error: `ÐÑÐ¸Ð±ÐºÐ° Ð°Ð²ÑÐ¾ÑÐ¸Ð·Ð°ÑÐ¸Ð¸ (401). ÐÑÐ¾Ð²ÐµÑÑÑÐµ ÑÐ¾ÐºÐµÐ½ GitHub Ð² Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ°Ñ Engine.` };
    if (res.status === 403) return { error: `ÐÐµÑ Ð´Ð¾ÑÑÑÐ¿Ð° (403) Ðº ÑÐ°Ð¹Ð»Ñ \`${path}\`. ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð¿ÑÐ°Ð²Ð° ÑÐ¾ÐºÐµÐ½Ð°.` };
    if (res.status === 404) return { error: `Ð¤Ð°Ð¹Ð» Ð½Ðµ Ð½Ð°Ð¹Ð´ÐµÐ½ (404): \`${path}\` Ð² ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¸ ${repo}` };
    if (!res.ok) return { error: `GitHub API Ð²ÐµÑÐ½ÑÐ» HTTP ${res.status} Ð´Ð»Ñ \`${path}\`` };

    let data: { content?: string; type?: string; message?: string };
    try { data = await res.json(); } catch { return { error: `ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐ°Ð·Ð¾Ð±ÑÐ°ÑÑ Ð¾ÑÐ²ÐµÑ GitHub Ð´Ð»Ñ \`${path}\`` }; }

    if (data.message) return { error: `GitHub: ${data.message}` };
    if (!data.content) return { error: `Ð¤Ð°Ð¹Ð» \`${path}\` Ð¿ÑÑÑ Ð¸Ð»Ð¸ ÑÐ²Ð»ÑÐµÑÑÑ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸ÐµÐ¹` };

    // ÐÐ¾ÑÑÐµÐºÑÐ½Ð¾Ðµ Ð´ÐµÐºÐ¾Ð´Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ base64 â UTF-8 (ÑÐ°Ð±Ð¾ÑÐ°ÐµÑ Ñ ÐºÐ¸ÑÐ¸Ð»Ð»Ð¸ÑÐµÐ¹ Ð¸ Ð»ÑÐ±ÑÐ¼Ð¸ ÑÐ¸Ð¼Ð²Ð¾Ð»Ð°Ð¼Ð¸)
    try {
      const b64 = data.content.replace(/\s/g, "");
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      return { content: new TextDecoder("utf-8").decode(bytes) };
    } catch (e) {
      return { error: `ÐÑÐ¸Ð±ÐºÐ° Ð´ÐµÐºÐ¾Ð´Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ñ ÑÐ°Ð¹Ð»Ð° \`${path}\`: ${String(e)}` };
    }
  };

  const handleSendChat = useCallback(async (text: string) => {
    if (!settings.apiKey) { setSettingsOpen(true); return; }
    setCycleStatus("generating");
    setCycleLabel("ÐÑÐ¼Ð°Ñ...");
    const token = ghSettings.token;
    const repo = ghSettings.repo;
    const branch = ghSettings.branch || "main";
    try {
      const repoInfo = token && repo
        ? `\n\nÐÐ¾Ð´ÐºÐ»ÑÑÑÐ½ GitHub ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹: ${repo} (Ð²ÐµÑÐºÐ°: ${branch}).
ÐÐ¾ÑÑÑÐ¿Ð½Ñ action-Ð±Ð»Ð¾ÐºÐ¸ Ð´Ð»Ñ ÑÐ°Ð±Ð¾ÑÑ Ñ ÑÐ°Ð¹Ð»Ð°Ð¼Ð¸:
- Ð¡Ð¿Ð¸ÑÐ¾Ðº ÑÐ°Ð¹Ð»Ð¾Ð² Ð² Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ð¸: \`{"action":"list","path":"src/lumen"}\`
- ÐÑÐ¾ÑÐ¸ÑÐ°ÑÑ Ð¾Ð´Ð¸Ð½ ÑÐ°Ð¹Ð»: \`{"action":"read","path":"src/App.tsx"}\`
- ÐÑÐ¾ÑÐ¸ÑÐ°ÑÑ Ð½ÐµÑÐºÐ¾Ð»ÑÐºÐ¾ ÑÐ°Ð¹Ð»Ð¾Ð² ÑÑÐ°Ð·Ñ: \`{"action":"read_multiple","paths":["src/App.tsx","src/lumen/LumenApp.tsx"]}\`

ÐÑÐ²ÐµÑÐ°Ð¹ ÑÐ¾Ð»ÑÐºÐ¾ Ð¾Ð´Ð¸Ð½ action-Ð±Ð»Ð¾Ðº Ð·Ð° ÑÐ°Ð·. ÐÐ¾ÑÐ»Ðµ Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ ÑÐ°Ð¹Ð»Ð¾Ð² â ÑÑÐ°Ð·Ñ Ð²ÑÐ¿Ð¾Ð»Ð½Ð¸ Ð·Ð°Ð´Ð°ÑÑ.`
        : "";
      const chatSystemPrompt = `Ð¢Ñ Ð´ÑÑÐ¶ÐµÐ»ÑÐ±Ð½ÑÐ¹ AI-Ð°ÑÑÐ¸ÑÑÐµÐ½Ñ ÐÑÑÐ°Ð²ÐµÐ¹. ÐÑÐ²ÐµÑÐ°Ð¹ ÐºÑÐ°ÑÐºÐ¾ Ð¸ Ð¿Ð¾ Ð´ÐµÐ»Ñ Ð½Ð° ÑÑÑÑÐºÐ¾Ð¼ ÑÐ·ÑÐºÐµ. ÐÐ¾Ð¼Ð¾Ð³Ð°Ð¹ Ñ Ð²Ð¾Ð¿ÑÐ¾ÑÐ°Ð¼Ð¸ Ð¾ ÑÐ°Ð¹ÑÐ°Ñ, Ð±Ð¸Ð·Ð½ÐµÑÐµ, Ð¼Ð°ÑÐºÐµÑÐ¸Ð½Ð³Ðµ Ð¸ Ð²ÑÑÐ¼ Ð¾ÑÑÐ°Ð»ÑÐ½Ð¾Ð¼.${repoInfo}
${PROJECT_STRUCTURE}`;

      // ââ Ð¨Ð°Ð³ 1: Ð¿ÐµÑÐ²ÑÐ¹ Ð²ÑÐ·Ð¾Ð² ÐÐ ââââââââââââââââââââââââââââââââââââââââââââ
      const response = await callAI(
        chatSystemPrompt,
        text,
        (chars) => setCycleLabel(`ÐÑÐ¼Ð°Ñ... ${chars} ÑÐ¸Ð¼Ð².`),
        true
      );

      // ââ Ð¨Ð°Ð³ 2: Ð¾Ð±ÑÐ°Ð±Ð°ÑÑÐ²Ð°ÐµÐ¼ action-Ð±Ð»Ð¾ÐºÐ¸ âââââââââââââââââââââââââââââââââ
      const actionMatch = response.match(/```action\s*([\s\S]*?)```/);
      if (actionMatch && token && repo) {
        let actionData: { action: string; path?: string; paths?: string[] };
        try { actionData = JSON.parse(actionMatch[1].trim()); } catch { actionData = { action: "none" }; }
        const cleanResponse = response.replace(/```action[\s\S]*?```/, "").trim();

        // action: list
        if (actionData.action === "list" && actionData.path) {
          setCycleLabel(`Ð§Ð¸ÑÐ°Ñ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ñ ${actionData.path}...`);
          const listing = await listDirFromGitHub(actionData.path, token, repo, branch);
          if (listing) {
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐ¡Ð¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ðµ \`${actionData.path}\`:\n\`\`\`\n${listing}\n\`\`\``.trim() }]);
            setCycleLabel("ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ ÑÐ¿Ð¸ÑÐ¾Ðº...");
            const response2 = await callAI(chatSystemPrompt, `ÐÐ¸ÑÐµÐºÑÐ¾ÑÐ¸Ñ ${actionData.path}:\n${listing}\n\nÐÐ°Ð´Ð°ÑÐ°: ${text}`, (c) => setCycleLabel(`ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ... ${c} ÑÐ¸Ð¼Ð².`), true);
            setCycleStatus("done"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
          } else {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¿ÑÐ¾ÑÐ¸ÑÐ°ÑÑ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ñ \`${actionData.path}\`.`.trim() }]);
          }
          return;
        }

        // action: read_multiple
        if (actionData.action === "read_multiple" && actionData.paths?.length) {
          const filesContent: string[] = [];
          const errors: string[] = [];
          for (let i = 0; i < actionData.paths.length; i++) {
            const p = actionData.paths[i];
            setCycleLabel(`Ð§Ð¸ÑÐ°Ñ ÑÐ°Ð¹Ð» ${i + 1}/${actionData.paths.length}: ${p}`);
            const result = await readFileFromGitHub(p, token, repo, branch);
            if (result.content !== undefined) {
              const sizeStr = result.content.length < 1024 ? `${result.content.length} Ð±Ð°Ð¹Ñ` : `${(result.content.length / 1024).toFixed(1)} ÐÐ`;
              const body = result.content.length > 8000 ? result.content.slice(0, 8000) + "\n... [Ð¾Ð±ÑÐµÐ·Ð°Ð½]" : result.content;
              filesContent.push(`### ${p} (${sizeStr})\n\`\`\`\n${body}\n\`\`\``);
            } else {
              errors.push(`â ï¸ ${p}: ${result.error}`);
              filesContent.push(`### ${p}\n[${result.error}]`);
            }
          }
          const errNote = errors.length ? `\n\n${errors.join("\n")}` : "";
          setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐÑÐ¾ÑÐ¸ÑÐ°Ð» ${filesContent.length} ÑÐ°Ð¹Ð»(Ð¾Ð²).${errNote}\nÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...`.trim() }]);
          setCycleLabel(`ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ ${filesContent.length} ÑÐ°Ð¹Ð»Ð¾Ð²...`);
          const response2 = await callAI(chatSystemPrompt, `Ð¤Ð°Ð¹Ð»Ñ:\n\n${filesContent.join("\n\n")}\n\nÐÐ°Ð´Ð°ÑÐ°: ${text}`, (c) => setCycleLabel(`ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ... ${c} ÑÐ¸Ð¼Ð².`), true);
          setCycleStatus("done"); setCycleLabel("");
          setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
          return;
        }

        // action: read (Ð¾Ð´Ð¸Ð½ ÑÐ°Ð¹Ð»)
        if (actionData.action === "read" && actionData.path) {
          setCycleLabel(`Ð§Ð¸ÑÐ°Ñ ${actionData.path}...`);
          const result = await readFileFromGitHub(actionData.path, token, repo, branch);
          if (result.content !== undefined) {
            const sizeStr = result.content.length < 1024 ? `${result.content.length} Ð±Ð°Ð¹Ñ` : `${(result.content.length / 1024).toFixed(1)} ÐÐ`;
            const truncated = result.content.length > 8000 ? result.content.slice(0, 8000) + "\n... [Ð¾Ð±ÑÐµÐ·Ð°Ð½]" : result.content;
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐÑÐ¾ÑÐ¸ÑÐ°Ð» \`${actionData.path}\` (${sizeStr}). ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...`.trim() }]);
            setCycleLabel("ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...");
            const response2 = await callAI(chatSystemPrompt, `Ð¤Ð°Ð¹Ð» \`${actionData.path}\`:\n\`\`\`\n${truncated}\n\`\`\`\n\nÐÐ°Ð´Ð°ÑÐ°: ${text}`, (c) => setCycleLabel(`ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ... ${c} ÑÐ¸Ð¼Ð².`), true);
            setCycleStatus("done"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
          } else {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ ${result.error}`.trim() }]);
          }
          return;
        }
      }

      setCycleStatus("done");
      setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response }]);
    } catch (err) {
      setCycleStatus("error");
      setCycleLabel("");
      const errText = err instanceof Error ? err.message : "ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°";
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ°: ${errText}` }]);
    }
  }, [settings, ghSettings, messages]);

  // ââ ÐÐµÐ½ÐµÑÐ°ÑÐ¸Ñ SQL-Ð¼Ð¸Ð³ÑÐ°ÑÐ¸Ð¸ Ð¿Ð¾ Ð·Ð°Ð¿ÑÐ¾ÑÑ Ð² ÑÐ°ÑÐµ âââââââââââââââââââââââââââââââ
  const [pendingSql, setPendingSql] = useState<{ sql: string; explanation: string } | null>(null);

  const handleSqlRequest = useCallback(async (text: string) => {
    if (!settings.apiKey) { setSettingsOpen(true); return; }
    setCycleStatus("generating");
    setCycleLabel("ÐÐµÐ½ÐµÑÐ¸ÑÑÑ SQL...");
    try {
      const raw = await callAI(SQL_MIGRATION_SYSTEM_PROMPT, text, (chars) =>
        setCycleLabel(`ÐÐµÐ½ÐµÑÐ¸ÑÑÑ SQL... ${chars} ÑÐ¸Ð¼Ð².`), true
      );
      let parsed: { sql: string; explanation: string };
      try {
        const match = raw.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : raw);
      } catch {
        parsed = { sql: raw, explanation: "SQL-Ð¼Ð¸Ð³ÑÐ°ÑÐ¸Ñ ÑÐ³ÐµÐ½ÐµÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð°." };
      }
      setPendingSql(parsed);
      setCycleStatus("done");
      setCycleLabel("");
      setMessages(prev => [...prev, {
        id: ++msgCounter, role: "assistant",
        text: `SQL-Ð¼Ð¸Ð³ÑÐ°ÑÐ¸Ñ Ð³Ð¾ÑÐ¾Ð²Ð°\n\n${parsed.explanation}\n\n${parsed.sql}\n\nÐÐ°Ð¶Ð¼Ð¸ÑÐµ ÐºÐ½Ð¾Ð¿ÐºÑ Â«Ð¡ÐºÐ¾Ð¿Ð¸ÑÐ¾Ð²Ð°ÑÑ SQLÂ» Ð½Ð¸Ð¶Ðµ.`,
      }]);
    } catch (err) {
      setCycleStatus("error");
      setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ°: ${err instanceof Error ? err.message : String(err)}` }]);
    }
  }, [settings, messages]);

  // ââ Ð£ÑÐ¸Ð»Ð¸ÑÐ°: ÑÐ¿Ð¸ÑÐ¾Ðº ÑÐ°Ð¹Ð»Ð¾Ð² Ð² Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ð¸ ÑÐµÑÐµÐ· GitHub API ââââââââââââââââââ
  const listDirFromGitHub = async (dirPath: string, token: string, repo: string, branch: string): Promise<string | null> => {
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${dirPath}?ref=${branch}`;
    const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
    if (!res.ok) return null;
    const data = await res.json() as { name: string; type: string; size: number }[];
    if (!Array.isArray(data)) return null;
    const lines = data.map(f => `${f.type === "dir" ? "ð" : "ð"} ${dirPath}/${f.name}${f.type === "file" ? ` (${f.size} Ð±Ð°Ð¹Ñ)` : ""}`);
    return lines.join("\n");
  };

  // ââ Self-Edit Mode â ÐÐ ÑÐ¸ÑÐ°ÐµÑ/Ð¿Ð¸ÑÐµÑ ÑÐ°Ð¹Ð»Ñ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ ÑÐµÑÐµÐ· GitHub API ââââââââ
  const handleSelfEditChat = useCallback(async (text: string) => {
    if (!settings.apiKey) { setSettingsOpen(true); return; }
    const engineToken = ghSettings.engineToken || ghSettings.token;
    const engineRepo = ghSettings.engineRepo;
    const engineBranch = ghSettings.engineBranch || "main";

    // ÐÑÐ¾Ð²ÐµÑÑÐµÐ¼ Ð¾Ð±ÑÐ·Ð°ÑÐµÐ»ÑÐ½ÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸ Engine
    if (!engineToken || !engineRepo) {
      setMessages(prev => [...prev, {
        id: ++msgCounter, role: "assistant",
        text: "â ï¸ Self-Edit Mode: Ð½Ðµ Ð½Ð°ÑÑÑÐ¾ÐµÐ½ Engine-ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹ Ð¸Ð»Ð¸ ÑÐ¾ÐºÐµÐ½.\n\nÐÑÐºÑÐ¾Ð¹ÑÐµ **ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸ â Self-Edit / Engine GitHub** Ð¸ Ð·Ð°Ð¿Ð¾Ð»Ð½Ð¸ÑÐµ:\n- Engine Token (GitHub Personal Access Token)\n- Engine Repository (Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ: `your-user/your-repo`)\n- Engine Branch (Ð¾Ð±ÑÑÐ½Ð¾ `main`)",
      }]);
      return;
    }

    setCycleStatus("generating");
    setCycleLabel("Self-Edit: Ð´ÑÐ¼Ð°Ñ...");
    try {
      const systemPrompt = SELF_EDIT_SYSTEM_PROMPT(engineRepo, engineBranch);
      const response = await callAI(systemPrompt, text, (chars) => setCycleLabel(`Self-Edit: ${chars} ÑÐ¸Ð¼Ð².`), true);

      // ÐÐ°ÑÑÐ¸Ð¼ action-Ð±Ð»Ð¾ÐºÐ¸ Ð¸Ð· Ð¾ÑÐ²ÐµÑÐ° ÐÐ
      const actionMatch = response.match(/```action\s*([\s\S]*?)```/);
      if (actionMatch && engineToken) {
        let actionData: { action: string; path?: string; paths?: string[]; content?: string };
        try { actionData = JSON.parse(actionMatch[1].trim()); } catch { actionData = { action: "none" }; }

        // action: list â ÑÐ¿Ð¸ÑÐ¾Ðº ÑÐ°Ð¹Ð»Ð¾Ð² Ð² Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ð¸
        if (actionData.action === "list" && actionData.path) {
          setCycleLabel("Self-Edit: ÑÐ¸ÑÐ°Ñ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ñ...");
          const listing = await listDirFromGitHub(actionData.path, engineToken, engineRepo, engineBranch);
          const cleanResponse = response.replace(/```action[\s\S]*?```/, "").trim();
          if (listing) {
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐ¡Ð¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ðµ \`${actionData.path}\`:\n\`\`\`\n${listing}\n\`\`\``.trim() }]);
            const response2 = await callAI(systemPrompt, `Ð¡Ð¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ðµ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ð¸ ${actionData.path}:\n${listing}\n\nÐ¢ÐµÐ¿ÐµÑÑ Ð²ÑÐ¿Ð¾Ð»Ð½Ð¸ Ð·Ð°Ð¿ÑÐ¾Ñ: ${text}`, (chars) => setCycleLabel(`Self-Edit: ${chars} ÑÐ¸Ð¼Ð².`), true);
            setCycleStatus("done"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
          } else {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¿ÑÐ¾ÑÐ¸ÑÐ°ÑÑ Ð´Ð¸ÑÐµÐºÑÐ¾ÑÐ¸Ñ \`${actionData.path}\`.`.trim() }]);
          }
          return;
        }

        // action: read_multiple â ÑÐ¸ÑÐ°ÐµÐ¼ Ð½ÐµÑÐºÐ¾Ð»ÑÐºÐ¾ ÑÐ°Ð¹Ð»Ð¾Ð² Ð·Ð° ÑÐ°Ð·
        if (actionData.action === "read_multiple" && actionData.paths && actionData.paths.length > 0) {
          setCycleLabel("Self-Edit: ÑÐ¸ÑÐ°Ñ ÑÐ°Ð¹Ð»Ñ...");
          const cleanResponse = response.replace(/```action[\s\S]*?```/, "").trim();
          const filesContent: string[] = [];
          for (let i = 0; i < actionData.paths.length; i++) {
            const p = actionData.paths[i];
            setCycleLabel(`Self-Edit: ÑÐ¸ÑÐ°Ñ ${i + 1}/${actionData.paths.length}...`);
            const result = await readFileFromGitHub(p, engineToken, engineRepo, engineBranch);
            if (result.content !== undefined) {
              const sizeStr = result.content.length < 1024 ? `${result.content.length} Ð±Ð°Ð¹Ñ` : `${(result.content.length / 1024).toFixed(1)} ÐÐ`;
              const body = result.content.length > 8000 ? result.content.slice(0, 8000) + "\n... [Ð¾Ð±ÑÐµÐ·Ð°Ð½]" : result.content;
              filesContent.push(`### ${p} (${sizeStr})\n\`\`\`\n${body}\n\`\`\``);
            } else {
              filesContent.push(`### ${p}\n[${result.error}]`);
            }
          }
          setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nÐÑÐ¾ÑÐ¸ÑÐ°Ð» ${filesContent.length} ÑÐ°Ð¹Ð»(Ð¾Ð²). ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...`.trim() }]);
          const response2 = await callAI(systemPrompt, `Ð¡Ð¾Ð´ÐµÑÐ¶Ð¸Ð¼Ð¾Ðµ ÑÐ°Ð¹Ð»Ð¾Ð²:\n\n${filesContent.join("\n\n")}\n\nÐ¢ÐµÐ¿ÐµÑÑ Ð²ÑÐ¿Ð¾Ð»Ð½Ð¸ Ð·Ð°Ð¿ÑÐ¾Ñ: ${text}`, (chars) => setCycleLabel(`Self-Edit: ${chars} ÑÐ¸Ð¼Ð².`), true);
          setCycleStatus("done"); setCycleLabel("");
          setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
          return;
        }

        if (actionData.action === "read" && actionData.path) {
          setCycleLabel(`Self-Edit: ÑÐ¸ÑÐ°Ñ ${actionData.path}...`);
          const result = await readFileFromGitHub(actionData.path, engineToken, engineRepo, engineBranch);
          const cleanResponse = response.replace(/```action[\s\S]*?```/, "").trim();
          if (result.content !== undefined) {
            const sizeStr = result.content.length < 1024 ? `${result.content.length} Ð±Ð°Ð¹Ñ` : `${(result.content.length / 1024).toFixed(1)} ÐÐ`;
            const body = result.content.length > 8000 ? result.content.slice(0, 8000) + "\n... [Ð¾Ð±ÑÐµÐ·Ð°Ð½]" : result.content;
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nð \`${actionData.path}\` (${sizeStr}) â Ð¿ÑÐ¾ÑÐ¸ÑÐ°Ð½. ÐÐ½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...`.trim() }]);
            setCycleLabel("Self-Edit: Ð°Ð½Ð°Ð»Ð¸Ð·Ð¸ÑÑÑ...");
            const response2 = await callAI(systemPrompt, `Ð¤Ð°Ð¹Ð» ${actionData.path}:\n\`\`\`\n${body}\n\`\`\`\n\nÐ¢ÐµÐ¿ÐµÑÑ Ð²ÑÐ¿Ð¾Ð»Ð½Ð¸ Ð¾ÑÐ¸Ð³Ð¸Ð½Ð°Ð»ÑÐ½ÑÐ¹ Ð·Ð°Ð¿ÑÐ¾Ñ: ${text}`, (chars) => setCycleLabel(`Self-Edit: ${chars} ÑÐ¸Ð¼Ð².`), true);
            setCycleStatus("done"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response2 }]);
            return;
          } else {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ ${result.error}`.trim() }]);
            return;
          }
        }

        if (actionData.action === "write" && actionData.path && actionData.content) {
          setCycleLabel(`Self-Edit: ÑÐ¾ÑÑÐ°Ð½ÑÑ ${actionData.path}...`);
          const cleanResponse = response.replace(/```action[\s\S]*?```/, "").trim();
          const apiUrl = `https://api.github.com/repos/${engineRepo}/contents/${encodeURIComponent(actionData.path).replace(/%2F/g, "/")}`;

          // ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ ÑÐµÐºÑÑÐ¸Ð¹ SHA (Ð½ÑÐ¶ÐµÐ½ Ð´Ð»Ñ Ð¾Ð±Ð½Ð¾Ð²Ð»ÐµÐ½Ð¸Ñ ÑÑÑÐµÑÑÐ²ÑÑÑÐµÐ³Ð¾ ÑÐ°Ð¹Ð»Ð°)
          let sha = "";
          try {
            const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(engineBranch)}`, {
              headers: { Authorization: `Bearer ${engineToken}`, Accept: "application/vnd.github+json" },
            });
            if (getRes.ok) {
              const d = await getRes.json() as { sha?: string };
              sha = d.sha || "";
            } else if (getRes.status !== 404) {
              const d = await getRes.json().catch(() => ({})) as { message?: string };
              setCycleStatus("error"); setCycleLabel("");
              setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ SHA ÑÐ°Ð¹Ð»Ð° \`${actionData.path}\`: HTTP ${getRes.status} ${d.message || ""}`.trim() }]);
              return;
            }
          } catch (e) {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ Ð¡ÐµÑÐµÐ²Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ° Ð¿ÑÐ¸ ÑÑÐµÐ½Ð¸Ð¸ SHA: ${String(e)}`.trim() }]);
            return;
          }

          // ÐÑÐ°Ð²Ð¸Ð»ÑÐ½Ð¾Ðµ ÐºÐ¾Ð´Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ UTF-8 â base64 ÑÐµÑÐµÐ· TextEncoder
          const utf8Bytes = new TextEncoder().encode(actionData.content);
          const b64Chunks: string[] = [];
          const chunkSize = 8192;
          for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
            b64Chunks.push(String.fromCharCode(...utf8Bytes.slice(i, i + chunkSize)));
          }
          const contentB64 = btoa(b64Chunks.join(""));

          const reqBody: Record<string, string> = {
            message: `ÐÑÑÐ°Ð²ÐµÐ¹: Ð¾Ð±Ð½Ð¾Ð²Ð¸Ð» ${actionData.path}`,
            content: contentB64,
            branch: engineBranch,
          };
          if (sha) reqBody.sha = sha;

          let putRes: Response;
          try {
            putRes = await fetch(apiUrl, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${engineToken}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(reqBody),
            });
          } catch (e) {
            setCycleStatus("error"); setCycleLabel("");
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ Ð¡ÐµÑÐµÐ²Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ° Ð¿ÑÐ¸ Ð·Ð°Ð¿Ð¸ÑÐ¸ ÑÐ°Ð¹Ð»Ð°: ${String(e)}`.trim() }]);
            return;
          }

          const putData = await putRes.json().catch(() => ({})) as { message?: string; content?: { html_url?: string } };
          setCycleStatus(putRes.ok ? "done" : "error"); setCycleLabel("");
          if (putRes.ok) {
            const fileUrl = putData.content?.html_url ? `\nð ${putData.content.html_url}` : "";
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ Ð¤Ð°Ð¹Ð» \`${actionData.path}\` Ð·Ð°Ð¿Ð¸ÑÐ°Ð½ Ð² \`${engineRepo}\` (Ð²ÐµÑÐºÐ° \`${engineBranch}\`).${fileUrl}`.trim() }]);
          } else {
            setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `${cleanResponse}\n\nâ ÐÑÐ¸Ð±ÐºÐ° Ð·Ð°Ð¿Ð¸ÑÐ¸ \`${actionData.path}\`: HTTP ${putRes.status} â ${putData.message || "Ð½ÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°"}`.trim() }]);
          }
          return;
        }
      }

      setCycleStatus("done"); setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: response }]);
    } catch (err) {
      setCycleStatus("error"); setCycleLabel("");
      setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ° Self-Edit: ${err instanceof Error ? err.message : String(err)}` }]);
    }
  }, [settings, ghSettings, messages, selfEditMode]);

  const handleSend = useCallback(async (text: string, mode: ChatMode = "site") => {
    abortRef.current = false;

    // ÐÑÐ¾Ð²ÐµÑÑÐµÐ¼ Ð±Ð°Ð»Ð°Ð½Ñ Ð´Ð»Ñ Ð¾Ð±ÑÑÐ½ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÐµÐ¹
    if (!authed) {
      const canSend = await spendRequest();
      if (!canSend) {
        setPaywallOpen(true);
        return;
      }
    }

    const userMsg: Message = { id: ++msgCounter, role: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setDeployResult(null);
    setPendingSql(null);

    if (mode === "chat") {
      // Self-Edit Mode â ÐÐ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÑÐµÑ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ ÑÐµÑÐµÐ· GitHub
      if (selfEditMode && ghSettings.engineRepo) {
        await handleSelfEditChat(text);
        return;
      }
      // ÐÑÐ»Ð¸ Ð·Ð°Ð¿ÑÐ¾Ñ Ð¿ÑÐ¾ ÐÐ/SQL â Ð³ÐµÐ½ÐµÑÐ¸ÑÑÐµÐ¼ Ð¼Ð¸Ð³ÑÐ°ÑÐ¸Ñ
      const isSqlRequest = /ÑÐ¾Ð·Ð´Ð°Ð¹ ÑÐ°Ð±Ð»Ð¸Ñ|Ð´Ð¾Ð±Ð°Ð²Ñ ÐºÐ¾Ð»Ð¾Ð½Ðº|Ð¸Ð·Ð¼ÐµÐ½Ð¸ ÑÑÐµÐ¼Ñ|Ð¼Ð¸Ð³ÑÐ°ÑÐ¸|sql|create table|alter table|Ð´Ð¾Ð±Ð°Ð²Ñ Ð¿Ð¾Ð»Ðµ|ÑÐ´Ð°Ð»Ð¸ ÐºÐ¾Ð»Ð¾Ð½Ðº|Ð¸Ð½Ð´ÐµÐºÑ|foreign key|Ð±Ð°Ð·Ð° Ð´Ð°Ð½Ð½ÑÑ.*Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ|Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ.*Ð±Ð°Ð·Ñ/i.test(text);
      if (isSqlRequest) {
        await handleSqlRequest(text);
      } else {
        await handleSendChat(text);
      }
      return;
    }

    if (mode === "image") {
      await handleSendImage(text);
      return;
    }

    // ââ Ð ÐµÐ¶Ð¸Ð¼ "site" âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
    if (!settings.apiKey) { setSettingsOpen(true); return; }

    try {
      // ââ Ð¨Ð°Ð³ 1: ÑÐ¸ÑÐ°ÐµÐ¼ ÑÐµÐºÑÑÐ¸Ð¹ ÐºÐ¾Ð´ âââââââââââââââââââââââââââââââââââââââââ
      let currentHtml = "";
      const customAddition = settings.customPrompt?.trim() ? `\n\n## ÐÐ¾Ð¿Ð¾Ð»Ð½Ð¸ÑÐµÐ»ÑÐ½ÑÐµ Ð¸Ð½ÑÑÑÑÐºÑÐ¸Ð¸ Ð¾Ñ Ð²Ð»Ð°Ð´ÐµÐ»ÑÑÐ°:\n${settings.customPrompt.trim()}` : "";
      let systemPrompt = CREATE_SYSTEM_PROMPT + customAddition;

      if (fullCodeContext) {
        currentHtml = fullCodeContext.html;
        systemPrompt = LOCAL_FILE_EDIT_PROMPT(currentHtml, fullCodeContext.fileName) + customAddition;
      } else if (ghSettings.token && ghSettings.repo) {
        setCycleStatus("reading");
        const filePath = (ghSettings.filePath || "index.html").trim().replace(/^\//, "");
        setCycleLabel(`Ð§Ð¸ÑÐ°Ñ ${filePath} Ð¸Ð· GitHub...`);
        const fetched = await fetchFromGitHub();
        if (fetched.ok && fetched.html) {
          currentHtml = fetched.html;
          setCurrentFileSha(fetched.sha);
          setCurrentFilePath(fetched.filePath);
          systemPrompt = EDIT_SYSTEM_PROMPT_FULL(currentHtml) + customAddition;
        } else if (!fetched.ok) {
          const is404 = fetched.message?.includes("404");
          if (!is404) {
            // Ð ÐµÐ°Ð»ÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ° (ÑÐ¾ÐºÐµÐ½, ÑÐµÑÑ) â Ð¿ÑÐµÑÑÐ²Ð°ÐµÐ¼ Ð¸ ÑÐ¾Ð¾Ð±ÑÐ°ÐµÐ¼
            throw new Error(`ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¿ÑÐ¾ÑÐ¸ÑÐ°ÑÑ ÑÐ°Ð¹Ð» Ð¸Ð· GitHub: ${fetched.message}`);
          }
          // 404 = ÑÐ°Ð¹Ð»Ð° ÐµÑÑ Ð½ÐµÑ, ÑÐ¾Ð·Ð´Ð°ÑÐ¼ Ñ Ð½ÑÐ»Ñ (Ð½Ð¾ÑÐ¼Ð°Ð»ÑÐ½Ð¾ Ð´Ð»Ñ Ð¿ÐµÑÐ²Ð¾Ð³Ð¾ ÑÐ°Ð·Ð°)
        }
      }

      if (abortRef.current) return;

      // ââ Ð¨Ð°Ð³ 1.5: Ð³ÐµÐ½ÐµÑÐ¸ÑÑÐµÐ¼ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ ÐµÑÐ»Ð¸ Ð½ÑÐ¶Ð½Ñ ââââââââââââââââââââââââââ
      let enrichedText = text;
      const wantsImages = /ÐºÐ°ÑÑÐ¸Ð½Ðº|ÑÐ¾ÑÐ¾|Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¸|Ð±Ð°Ð½Ð½ÐµÑ|Ð³Ð°Ð»ÐµÑÐµ|Ð¿ÑÐ¸ÑÐ¾Ð´|Ð¸Ð½ÑÐµÑÑÐµÑ|Ð¿ÐµÐ¹Ð·Ð°Ð¶|Ð²Ð¸Ð´|ÑÐ¾Ð²Ð°Ñ|Ð¿ÑÐ¾Ð´ÑÐºÑ|Ð±Ð»ÑÐ´|ÐµÐ´Ð°|ÑÐµÑÑÐ¾ÑÐ°Ð½|ÐºÐ°ÑÐµ|ÐºÐ¾ÑÐµÐ¹Ð½|Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½|ÑÐ¿Ð¾ÑÑÐ·Ð°Ð»|ÑÐ¸ÑÐ½ÐµÑ|Ð¾ÑÐµÐ»Ñ|image|photo|banner|gallery|nature|landscape/i.test(text);
      if (wantsImages) {
        setCycleStatus("generating");
        setCycleLabel("ÐÐµÐ½ÐµÑÐ¸ÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸...");
        const imgPromptsRaw = await callAI(
          `ÐÐ¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»Ñ Ð¿ÑÐ¾ÑÐ¸Ñ ÑÐ¾Ð·Ð´Ð°ÑÑ ÑÐ°Ð¹Ñ. ÐÐ¿ÑÐµÐ´ÐµÐ»Ð¸ ÐºÐ°ÐºÐ¸Ðµ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ Ð½ÑÐ¶Ð½Ñ Ð¸ Ð¿ÑÐ¸Ð´ÑÐ¼Ð°Ð¹ 2-3 ÐºÐ¾ÑÐ¾ÑÐºÐ¸Ñ Ð¾Ð¿Ð¸ÑÐ°Ð½Ð¸Ñ Ð½Ð° Ð°Ð½Ð³Ð»Ð¸Ð¹ÑÐºÐ¾Ð¼ ÑÐ·ÑÐºÐµ Ð´Ð»Ñ Ð³ÐµÐ½ÐµÑÐ°ÑÐ¸Ð¸ Ð¸Ð·Ð¾Ð±ÑÐ°Ð¶ÐµÐ½Ð¸Ð¹ ÑÐµÑÐµÐ· AI.
ÐÑÐ°Ð²Ð¸Ð»Ð°: Ð¾Ð¿Ð¸ÑÐ°Ð½Ð¸Ñ Ð´Ð¾Ð»Ð¶Ð½Ñ ÑÐ¾ÑÐ½Ð¾ ÑÐ¾Ð¾ÑÐ²ÐµÑÑÑÐ²Ð¾Ð²Ð°ÑÑ ÑÐµÐ¼Ðµ ÑÐ°Ð¹ÑÐ°, Ð±ÑÑÑ Ð²Ð¸Ð·ÑÐ°Ð»ÑÐ½Ð¾ ÐºÑÐ°ÑÐ¸Ð²ÑÐ¼Ð¸, ÑÐ¾ÑÐ¾ÑÐµÐ°Ð»Ð¸ÑÑÐ¸ÑÐ½ÑÐ¼Ð¸.
ÐÐµÑÐ½Ð¸ Ð¢ÐÐÐ¬ÐÐ JSON Ð¼Ð°ÑÑÐ¸Ð² ÑÑÑÐ¾Ðº, Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ: ["modern gym interior with equipment", "fitness trainer with client"].
ÐÐµÐ· Ð¿Ð¾ÑÑÐ½ÐµÐ½Ð¸Ð¹, ÑÐ¾Ð»ÑÐºÐ¾ JSON.`,
          text
        );
        let imgPrompts: string[] = [];
        try {
          const match = imgPromptsRaw.match(/\[[\s\S]*?\]/);
          if (match) imgPrompts = JSON.parse(match[0]);
        } catch { imgPrompts = []; }

        if (imgPrompts.length > 0) {
          const generatedUrls: string[] = [];
          for (let i = 0; i < imgPrompts.length; i++) {
            if (abortRef.current) return;
            setCycleLabel(`ÐÐµÐ½ÐµÑÐ¸ÑÑÑ ÐºÐ°ÑÑÐ¸Ð½ÐºÑ ${i + 1}/${imgPrompts.length}...`);
            try {
              const r = await fetch(IMAGE_GENERATE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: imgPrompts[i] }),
              });
              const d = await r.json();
              if (d.url) generatedUrls.push(d.url);
            } catch { /* Ð¿ÑÐ¾Ð´Ð¾Ð»Ð¶Ð°ÐµÐ¼ Ð±ÐµÐ· ÑÑÐ¾Ð¹ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ */ }
          }
          if (generatedUrls.length > 0) {
            const urlList = generatedUrls.map((u, i) => `URL ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ ${i + 1}: ${u}`).join("\n");
            enrichedText = `${text}

ÐÐÐÐÐ: Ð¯ ÑÐ¶Ðµ ÑÐ³ÐµÐ½ÐµÑÐ¸ÑÐ¾Ð²Ð°Ð» ÑÐ¿ÐµÑÐ¸Ð°Ð»ÑÐ½ÑÐµ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ Ð´Ð»Ñ ÑÑÐ¾Ð³Ð¾ ÑÐ°Ð¹ÑÐ°. ÐÐÐ¯ÐÐÐ¢ÐÐÐ¬ÐÐ Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐ¹ Ð¸Ñ Ð² Ð´Ð¸Ð·Ð°Ð¹Ð½Ðµ:
${urlList}

Ð¢ÑÐµÐ±Ð¾Ð²Ð°Ð½Ð¸Ñ Ðº Ð¸ÑÐ¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°Ð½Ð¸Ñ ÐºÐ°ÑÑÐ¸Ð½Ð¾Ðº:
- ÐÐµÑÐ²Ð°Ñ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ° â Ð³Ð»Ð°Ð²Ð½ÑÐ¹ Ð±Ð°Ð½Ð½ÐµÑ/Ð³ÐµÑÐ¾Ð¹ ÑÐµÐºÑÐ¸Ñ Ð½Ð° Ð²ÑÑ ÑÐ¸ÑÐ¸Ð½Ñ (object-fit: cover, height: 400-500px)
- ÐÑÑÐ°Ð»ÑÐ½ÑÐµ ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ â Ð² Ð³Ð°Ð»ÐµÑÐµÐµ, ÐºÐ°ÑÑÐ¾ÑÐºÐ°Ñ Ð¸Ð»Ð¸ ÑÐµÐºÑÐ¸ÑÑ ÑÐ°Ð¹ÑÐ°
- ÐÑÐµ <img> Ð´Ð¾Ð»Ð¶Ð½Ñ Ð¸Ð¼ÐµÑÑ style="object-fit: cover" Ð¸ Ð·Ð°Ð´Ð°Ð½Ð½ÑÐµ ÑÐ°Ð·Ð¼ÐµÑÑ
- ÐÐ Ð¸ÑÐ¿Ð¾Ð»ÑÐ·ÑÐ¹ placeholder-ÐºÐ°ÑÑÐ¸Ð½ÐºÐ¸ â ÑÐ¾Ð»ÑÐºÐ¾ Ð¿ÐµÑÐµÐ´Ð°Ð½Ð½ÑÐµ URL`;
          }
        }
      }

      if (abortRef.current) return;

      // ââ Ð¨Ð°Ð³ 2: Ð³ÐµÐ½ÐµÑÐ¸ÑÑÐµÐ¼ HTML ââââââââââââââââââââââââââââââââââââââââââââ
      setCycleStatus("generating");
      setCycleLabel("Ð¡Ð¾Ð·Ð´Ð°Ñ ÑÐ°Ð¹Ñ...");

      // ÐÑÐ¸ ÑÐµÐ´Ð°ÐºÑÐ¸ÑÐ¾Ð²Ð°Ð½Ð¸Ð¸ (ÐµÑÑÑ ÐºÐ¾Ð½ÑÐµÐºÑÑ) â Ð¿ÐµÑÐµÐ´Ð°ÑÐ¼ Ð¸ÑÑÐ¾ÑÐ¸Ñ ÑÐ°ÑÐ° Ð´Ð»Ñ Ð¿Ð°Ð¼ÑÑÐ¸ Ð¸Ð·Ð¼ÐµÐ½ÐµÐ½Ð¸Ð¹
      const passHistory = !!(fullCodeContext || (ghSettings.token && ghSettings.repo && currentHtml));
      const rawResponse = await callAI(systemPrompt, enrichedText, (chars) => {
        setCycleLabel(`Ð¡Ð¾Ð·Ð´Ð°Ñ ÑÐ°Ð¹Ñ... ${chars} ÑÐ¸Ð¼Ð².`);
      }, passHistory);
      const cleanHtml = extractHtml(rawResponse);

      if (!/<[a-z][\s\S]*>/i.test(cleanHtml)) {
        throw new Error(`ÐÐ¾Ð´ÐµÐ»Ñ Ð²ÐµÑÐ½ÑÐ»Ð° Ð½Ðµ HTML: "${cleanHtml.slice(0, 200)}". ÐÐ¾Ð¿ÑÐ¾Ð±ÑÐ¹ÑÐµ ÐµÑÑ ÑÐ°Ð·.`);
      }

      if (abortRef.current) return;

      const htmlWithBase = liveUrl ? injectBaseHref(cleanHtml, liveUrl) : cleanHtml;
      savePreviewHtml(injectLightTheme(htmlWithBase));
      setMobileTab("preview");

      const assistantId = ++msgCounter;
      const hasGitHub = !!(ghSettings.token && ghSettings.repo);
      setMessages(prev => [...prev, {
        id: assistantId,
        role: "assistant",
        text: currentHtml
          ? hasGitHub ? "ÐÐ¾ÑÐ¾Ð²Ð¾! ÐÑÐ°Ð²ÐºÐ¸ Ð²Ð½ÐµÑÐµÐ½Ñ. ÐÐ°Ð³ÑÑÐ¶Ð°Ñ Ð² GitHub..." : "ÐÐ¾ÑÐ¾Ð²Ð¾! ÐÑÐ°Ð²ÐºÐ¸ Ð²Ð½ÐµÑÐµÐ½Ñ. ÐÐ°ÑÑÑÐ¾Ð¹ÑÐµ GitHub ÑÑÐ¾Ð±Ñ ÑÐ¾ÑÑÐ°Ð½Ð¸ÑÑ."
          : hasGitHub ? "ÐÐ¾ÑÐ¾Ð²Ð¾! Ð¡Ð°Ð¹Ñ ÑÐ¾Ð·Ð´Ð°Ð½. ÐÐ°Ð³ÑÑÐ¶Ð°Ñ Ð² GitHub..." : "ÐÐ¾ÑÐ¾Ð²Ð¾! Ð¡Ð°Ð¹Ñ ÑÐ¾Ð·Ð´Ð°Ð½. ÐÐ°ÑÑÑÐ¾Ð¹ÑÐµ GitHub Ð´Ð»Ñ ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ.",
        html: cleanHtml,
      }]);

      // ââ ÐÐ¾ÐºÐ°Ð·ÑÐ²Ð°ÐµÐ¼ Ð±Ð°Ð½Ð½ÐµÑ Ð¾ Ð½ÐµÐ¾Ð±ÑÐ¾Ð´Ð¸Ð¼Ð¾ÑÑÐ¸ rebuild/Ð¿ÑÐ±Ð»Ð¸ÐºÐ°ÑÐ¸Ð¸ ââââââââââââââ
      setShowRebuildBanner(!ghSettings.token || !ghSettings.repo);

      // ââ Ð¨Ð°Ð³ 3: Ð°Ð²ÑÐ¾Ð´ÐµÐ¿Ð»Ð¾Ð¹ Ð² GitHub âââââââââââââââââââââââââââââââââââââââ
      if (ghSettings.token && ghSettings.repo) {
        setCycleLabel("ÐÐ°Ð³ÑÑÐ¶Ð°Ñ Ð² GitHub...");
        const filePath = currentFilePath || (ghSettings.filePath || "index.html").trim().replace(/^\//, "");
        const pushResult = await pushToGitHub(cleanHtml, "", filePath);

        if (pushResult.ok) {
          try {
            const fresh = await fetchFromGitHub();
            if (fresh.ok) {
              setCurrentFileSha(fresh.sha);
              setCurrentFilePath(fresh.filePath);
            }
          } catch (_e) { /* Ð½Ðµ ÐºÑÐ¸ÑÐ¸ÑÐ½Ð¾ */ }
        }

        setCycleStatus(pushResult.ok ? "done" : "error");
        setCycleLabel("");
        setDeployResult({ id: assistantId, ...pushResult });
        setTimeout(() => setDeployResult(null), pushResult.ok ? 8000 : 30000);
      } else {
        setCycleStatus("done");
        setCycleLabel("");
      }

    } catch (err) {
      if (!abortRef.current) {
        setCycleStatus("error");
        setCycleLabel("");
        const errText = err instanceof Error ? err.message : "ÐÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°";
        setMessages(prev => [...prev, { id: ++msgCounter, role: "assistant", text: `ÐÑÐ¸Ð±ÐºÐ°: ${errText}` }]);
      }
    }
  }, [settings, ghSettings, fetchFromGitHub, pushToGitHub, currentFilePath, fullCodeContext, liveUrl, handleSendChat, handleSendImage, handleSqlRequest, authed, spendRequest]);

  const handleApply = useCallback(async (msgId: number, html: string) => {
    if (!ghSettings.token) { setSettingsOpen(true); return; }
    setDeployingId(msgId);
    setDeployResult(null);

    const filePath = currentFilePath || (ghSettings.filePath || "index.html").trim().replace(/^\//, "");
    setCycleStatus("generating");
    setCycleLabel(`Ð¡Ð¾ÑÑÐ°Ð½ÑÑ ${filePath} Ð² GitHub...`);

    const result = await pushToGitHub(html, currentFileSha, filePath);

    if (result.ok) {
      // ÐÐ±Ð½Ð¾Ð²Ð»ÑÐµÐ¼ sha Ð¿Ð¾ÑÐ»Ðµ ÑÑÐ¿ÐµÑÐ½Ð¾Ð³Ð¾ Ð¿ÑÑÐ°
      try {
        const fresh = await fetchFromGitHub();
        if (fresh.ok) {
          setCurrentFileSha(fresh.sha);
          setCurrentFilePath(fresh.filePath);
        }
      } catch (_e) { /* Ð½Ðµ ÐºÑÐ¸ÑÐ¸ÑÐ½Ð¾ */ }
    }

    setCycleStatus(result.ok ? "done" : "error");
    setCycleLabel("");
    setDeployingId(null);
    setDeployResult({ id: msgId, ...result });
    setTimeout(() => setDeployResult(null), result.ok ? 6000 : 30000);
  }, [ghSettings, pushToGitHub, fetchFromGitHub, currentFileSha, currentFilePath]);

  const handleStop = () => {
    abortRef.current = true;
    setCycleStatus("idle");
    setCycleLabel("");
  };

  const handleLoadFromGitHub = useCallback(async () => {
    if (!ghSettings.token || !ghSettings.repo) { setSettingsOpen(true); return; }
    setLoadingFromGitHub(true);
    const fetched = await fetchFromGitHub();
    setLoadingFromGitHub(false);
    if (fetched.ok && fetched.html) {
      setCurrentFileSha(fetched.sha);
      setCurrentFilePath(fetched.filePath);
      savePreviewHtml(injectLightTheme(liveUrl ? injectBaseHref(fetched.html, liveUrl) : fetched.html));
      setMobileTab("preview");
      const id = ++msgCounter;
      setMessages([{
        id,
        role: "assistant",
        text: `ÐÐ°Ð³ÑÑÐ¶ÐµÐ½ ÑÐ°Ð¹Ð» Â«${fetched.filePath}Â». ÐÐ¸Ð¶Ñ Ð²Ð°Ñ ÑÐ°Ð¹Ñ. ÐÐ¿Ð¸ÑÐ¸ÑÐµ, ÑÑÐ¾ Ð½ÑÐ¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ â Ð²Ð½ÐµÑÑ Ð¿ÑÐ°Ð²ÐºÐ¸ Ð±ÐµÑÐµÐ¶Ð½Ð¾.`,
      }]);
    } else {
      const id = ++msgCounter;
      setMessages([{
        id,
        role: "assistant",
        text: `ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð·Ð°Ð³ÑÑÐ·Ð¸ÑÑ ÑÐ°Ð¹Ð»: ${fetched.message || "Ð½ÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°"}. ÐÑÐ¾Ð²ÐµÑÑÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸ GitHub.`,
      }]);
    }
  }, [ghSettings, fetchFromGitHub]);

  const handleLoadLocalFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const html = ev.target?.result as string;
      if (!html) return;
      setFullCodeContext({ html, fileName: file.name });
      savePreviewHtml(injectLightTheme(liveUrl ? injectBaseHref(html, liveUrl) : html));
      setMobileTab("preview");
      setMessages([{
        id: ++msgCounter,
        role: "assistant",
        text: `Ð¤Ð°Ð¹Ð» Â«${file.name}Â» Ð·Ð°Ð³ÑÑÐ¶ÐµÐ½ (${Math.round(file.size / 1024)} ÐÐ). ÐÐ¸Ð¶Ñ ÐºÐ¾Ð´. ÐÐ¿Ð¸ÑÐ¸ÑÐµ, ÑÑÐ¾ Ð½ÑÐ¶Ð½Ð¾ Ð¸Ð·Ð¼ÐµÐ½Ð¸ÑÑ â Ð¾ÑÑÐµÐ´Ð°ÐºÑÐ¸ÑÑÑ Ð¸ ÑÐ¾ÑÑÐ°Ð½Ñ Ð² GitHub ÐµÑÐ»Ð¸ Ð½Ð°ÑÑÑÐ¾ÐµÐ½.`,
      }]);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }, []);

  const handleNewProject = () => {
    setMessages([]);
    savePreviewHtml(null);
    setHtmlHistory([]);
    setCycleStatus("idle");
    setCycleLabel("");
    setMobileTab("chat");
    setDeployResult(null);
    setFullCodeContext(null);
  };

  const handleExport = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fullCodeContext?.fileName || "lumen-site.html";
    a.click();
    URL.revokeObjectURL(url);
  };





  const handleApplyToGitHub = useCallback(async () => {
    if (!ghSettings.token || !ghSettings.repo) {
      setSettingsOpen(true);
      throw new Error("GitHub Ð½Ðµ Ð½Ð°ÑÑÑÐ¾ÐµÐ½. ÐÑÐºÑÐ¾Ð¹ÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸.");
    }
    if (!previewHtml) throw new Error("ÐÐµÑ ÐºÐ¾Ð´Ð° Ð´Ð»Ñ ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ.");
    const filePath = currentFilePath || (ghSettings.filePath || "index.html").trim().replace(/^\//, "");
    const result = await pushToGitHub(previewHtml, currentFileSha, filePath);
    if (!result.ok) throw new Error(result.message || "ÐÑÐ¸Ð±ÐºÐ° ÑÐ¾ÑÑÐ°Ð½ÐµÐ½Ð¸Ñ");
    try {
      const fresh = await fetchFromGitHub();
      if (fresh.ok) { setCurrentFileSha(fresh.sha); setCurrentFilePath(fresh.filePath); }
    } catch (_e) { /* Ð½Ðµ ÐºÑÐ¸ÑÐ¸ÑÐ½Ð¾ */ }
  }, [ghSettings, previewHtml, currentFilePath, currentFileSha, pushToGitHub, fetchFromGitHub]);

  const handleSaveSettings = (s: Settings) => {
    setSettings(s);
    localStorage.setItem("lumen_settings", JSON.stringify(s));
  };

  const topStatus: "idle" | "generating" | "done" | "error" =
    cycleStatus === "reading" ? "generating" : cycleStatus;

  const isGenerating = cycleStatus === "generating" || cycleStatus === "reading";

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState(false);

  const handleAdminLogin = () => {
    const ok = adminLogin(adminPassword);
    if (ok) {
      setAdminModalOpen(false);
      setAdminPassword("");
      setAdminError(false);
      setSettingsOpen(true);
    } else {
      setAdminError(true);
      setAdminPassword("");
    }
  };

  const handleSettingsClick = () => {
    if (authed) {
      setSettingsOpen(true);
    } else {
      setAdminModalOpen(true);
      setAdminError(false);
      setAdminPassword("");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!loggedIn ? (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <LumenLoginPage onLogin={login} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-dvh flex flex-col bg-[#07070c] overflow-hidden"
          style={{ maxWidth: "100vw" }}
        >
          {/* Admin password modal */}
          <AnimatePresence>
            {adminModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                onClick={(e) => { if (e.target === e.currentTarget) { setAdminModalOpen(false); setAdminPassword(""); setAdminError(false); } }}
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.92, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="w-full max-w-sm bg-[#111118] border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#9333ea]/10 border border-[#9333ea]/20 flex items-center justify-center">
                      <Icon name="Lock" size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">ÐÐ¾ÑÑÑÐ¿ Ðº Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ°Ð¼</h3>
                      <p className="text-white/30 text-xs">ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð¿Ð°ÑÐ¾Ð»Ñ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ°</p>
                    </div>
                  </div>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => { setAdminPassword(e.target.value); setAdminError(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAdminLogin(); if (e.key === "Escape") { setAdminModalOpen(false); setAdminPassword(""); setAdminError(false); } }}
                    placeholder="ÐÐ°ÑÐ¾Ð»Ñ"
                    autoFocus
                    className={`w-full h-10 bg-white/[0.04] border rounded-xl px-3 text-white/80 text-sm placeholder:text-white/20 outline-none transition-colors ${adminError ? "border-red-500/50 focus:border-red-500/70" : "border-white/[0.08] focus:border-[#9333ea]/40"}`}
                  />
                  {adminError && (
                    <p className="text-red-400 text-xs -mt-2">ÐÐµÐ²ÐµÑÐ½ÑÐ¹ Ð¿Ð°ÑÐ¾Ð»Ñ</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAdminModalOpen(false); setAdminPassword(""); setAdminError(false); }}
                      className="flex-1 h-9 rounded-xl border border-white/[0.08] text-white/40 text-sm hover:bg-white/[0.04] transition-colors"
                    >
                      ÐÑÐ¼ÐµÐ½Ð°
                    </button>
                    <button
                      onClick={handleAdminLogin}
                      className="flex-1 h-9 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white text-sm font-semibold transition-colors"
                    >
                      ÐÐ¾Ð¹ÑÐ¸
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show TopBar only on chat/preview tabs (desktop-like) */}
          {(activeTab === "chat" || activeTab === "projects") && (
            <LumenTopBar
              status={topStatus}
              cycleLabel={cycleLabel}
              selfEditActive={selfEditMode}
              isAdmin={authed}
              onSettings={handleSettingsClick}
              onLogout={authed ? logout : undefined}
            />
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={handleLoadLocalFile}
          />

          {/* Hidden ZIP input */}
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleLoadZip}
          />

          {/* Main content area â switches between tabs */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <AnimatePresence mode="wait">

              {/* HOME TAB */}
              {activeTab === "home" && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <HomePage
                    onGoToChat={() => setActiveTab("chat")}
                    onGoToProjects={() => setActiveTab("projects")}
                    onGoToProfile={() => setActiveTab("profile")}
                  />
                </motion.div>
              )}

              {/* CHAT TAB */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* Rebuild notification banner */}
                  {showRebuildBanner && (
                    <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-amber-950/60 border-b border-amber-500/30 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-amber-300 font-medium">ÐÐ½ÐµÑÐµÐ½Ñ Ð¿ÑÐ°Ð²ÐºÐ¸ Ð² ÐºÐ¾Ð´ â Ð½Ð°Ð¶Ð¼Ð¸ÑÐµ Â«ÐÐ¿ÑÐ±Ð»Ð¸ÐºÐ¾Ð²Ð°ÑÑÂ»</span>
                      <button onClick={() => setShowRebuildBanner(false)} className="ml-auto text-amber-400/50 hover:text-amber-400 transition-colors text-[10px] px-2 py-0.5 rounded border border-amber-500/20">â</button>
                    </div>
                  )}
                  {fullCodeContext && (
                    <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-[#0d0d18] border-b border-cyan-500/20 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-white/40">ÐÐ¾ÐºÐ°Ð»ÑÐ½ÑÐ¹ ÑÐ°Ð¹Ð»:</span>
                      <span className="text-cyan-400 font-mono font-medium">{fullCodeContext.fileName}</span>
                      <button onClick={() => setFullCodeContext(null)} className="ml-auto text-white/20 hover:text-white/60 transition-colors text-[10px] px-2 py-0.5 rounded border border-white/10">â</button>
                    </div>
                  )}
                  {!fullCodeContext && currentFilePath && (
                    <div className="shrink-0 flex items-center gap-2 px-4 py-1.5 bg-[#0d0d18] border-b border-[#9333ea]/20 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white/40">Ð ÐµÐ´Ð°ÐºÑÐ¸ÑÑÐµÑÑÑ:</span>
                      <span className="text-emerald-400 font-mono font-medium">{currentFilePath}</span>
                      <span className="text-white/20 ml-auto font-mono">{ghSettings.repo}</span>
                    </div>
                  )}

                  {/* Mobile tab switcher chat/preview */}
                  <div className="md:hidden flex shrink-0 border-b border-white/[0.06] bg-[#0a0a0f]">
                    {(["chat", "preview"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setMobileTab(tab)}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          mobileTab === tab ? "text-[#f59e0b] border-b-2 border-[#f59e0b]" : "text-white/40 border-b-2 border-transparent"
                        }`}
                      >
                        {tab === "chat" ? <><span>ð¬</span> Ð§Ð°Ñ</> : <><span>ð¥ï¸</span> Ð¡Ð°Ð¹Ñ</>}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden relative md:flex md:gap-2 md:p-2">
                    <div className={`flex flex-col h-full md:w-[420px] md:flex-none bg-[#0a0a0f] md:static ${mobileTab === "chat" ? "absolute inset-0 z-10 flex" : "hidden md:flex"}`}>
                      {!authed && !publicAiEnabled ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-3xl">
                            ð
                          </div>
                          <div>
                            <h3 className="text-white/70 font-semibold text-base mb-1">ÐÑÑÐ°Ð²ÐµÐ¹ Ð²ÑÐµÐ¼ÐµÐ½Ð½Ð¾ ÑÐ¿Ð¸Ñ</h3>
                            <p className="text-white/30 text-sm leading-relaxed">ÐÐ-ÑÐµÐ¶Ð¸Ð¼ ÐµÑÑ Ð½Ðµ Ð²ÐºÐ»ÑÑÑÐ½. ÐÐ±ÑÐ°ÑÐ¸ÑÐµÑÑ Ðº Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÑ.</p>
                          </div>
                        </div>
                      ) : (
                        <ChatPanel
                          status={cycleStatus}
                          cycleLabel={cycleLabel}
                          messages={messages}
                          onSend={handleSend}
                          onStop={handleStop}
                          onApply={handleApply}
                          deployingId={deployingId}
                          deployResult={deployResult}
                          liveUrl={liveUrl}
                          onOpenPreview={() => setMobileTab("preview")}
                          onLoadFromGitHub={handleLoadFromGitHub}
                          loadingFromGitHub={loadingFromGitHub}
                          currentFilePath={ghSettings.filePath || "index.html"}
                          onLoadLocalFile={() => fileInputRef.current?.click()}
                          hasLocalFile={!!fullCodeContext}
                          localFileName={fullCodeContext?.fileName}
                          pendingSql={pendingSql}
                          hasGitHub={!!(ghSettings.token && ghSettings.repo)}
                          onOpenSettings={() => setSettingsOpen(true)}
                        />
                      )}
                    </div>
                    <div className={`flex flex-col h-full flex-1 min-w-0 ${mobileTab === "preview" ? "flex" : "hidden md:flex"}`}>
                      <LivePreview
                        status={topStatus}
                        previewHtml={previewHtml}
                        liveUrl={liveUrl}
                        onApplyToGitHub={ghSettings.token && ghSettings.repo ? handleApplyToGitHub : undefined}
                        onUndo={htmlHistory.length > 0 ? handleUndo : undefined}
                        canUndo={htmlHistory.length > 0}
                      />
                    </div>
                  </div>

                  {/* Ant worker animation */}
                  <AntWorker active={isGenerating} label={cycleLabel} />
                </motion.div>
              )}

              {/* PROJECTS TAB */}
              {activeTab === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6"
                >
                  <span className="text-5xl">ð</span>
                  <h2 className="text-white font-bold text-xl">ÐÐ¾Ð¸ Ð¿ÑÐ¾ÐµÐºÑÑ</h2>
                  <p className="text-white/40 text-sm text-center">ÐÐ´ÐµÑÑ Ð±ÑÐ´ÑÑ Ð²Ð°ÑÐ¸ ÑÐ¾ÑÑÐ°Ð½ÑÐ½Ð½ÑÐµ ÑÐ°Ð¹ÑÑ Ð¸ Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ</p>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="mt-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white font-semibold text-sm"
                  >
                    ð Ð¡Ð¾Ð·Ð´Ð°ÑÑ Ð¿ÐµÑÐ²ÑÐ¹ Ð¿ÑÐ¾ÐµÐºÑ
                  </button>
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 flex flex-col overflow-y-auto pb-4"
                >
                  <div className="px-4 py-6 flex flex-col items-center gap-3 border-b border-white/[0.06]">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-4xl shadow-[0_0_30px_#f59e0b40]">
                      ð
                    </div>
                    <div className="text-center">
                      <h2 className="text-white font-bold text-lg">ÐÑÐ¾ÑÐ¸Ð»Ñ</h2>
                      <p className="text-white/40 text-xs">ÐÑÑÐ°Ð²ÐµÐ¹ AI-ÑÐ°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº</p>
                    </div>
                  </div>
                  <div className="px-4 py-4 flex flex-col gap-2">
                    {/* ÐÐ°Ð»Ð°Ð½Ñ Ð·Ð°Ð¿ÑÐ¾ÑÐ¾Ð² Ð´Ð»Ñ Ð¾Ð±ÑÑÐ½ÑÑ Ð¿Ð¾Ð»ÑÐ·Ð¾Ð²Ð°ÑÐµÐ»ÐµÐ¹ */}
                    {!authed && muraveyBalance && (
                      <div className={`flex items-center justify-between px-4 py-3.5 rounded-xl border ${muraveyBalance.total_requests_left === 0 ? "bg-red-500/[0.05] border-red-500/20" : "bg-[#f59e0b]/[0.05] border-[#f59e0b]/20"}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl">ð</span>
                          <div>
                            <div className="text-white/80 text-sm font-medium">ÐÐ°Ð¿ÑÐ¾ÑÑ Ðº ÐÑÑÐ°Ð²ÑÑ</div>
                            <div className={`text-xs ${muraveyBalance.total_requests_left === 0 ? "text-red-400" : "text-[#f59e0b]/70"}`}>
                              {muraveyBalance.total_requests_left === 0
                                ? "ÐÐ°Ð¿ÑÐ¾ÑÑ Ð·Ð°ÐºÐ¾Ð½ÑÐ¸Ð»Ð¸ÑÑ"
                                : `ÐÑÑÐ°Ð»Ð¾ÑÑ ${muraveyBalance.total_requests_left} Ð·Ð°Ð¿ÑÐ¾ÑÐ¾Ð²`}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setPaywallOpen(true)}
                          className="text-xs font-semibold text-[#f59e0b] hover:text-[#f59e0b]/80 transition-colors shrink-0"
                        >
                          ÐÐ¾Ð¿Ð¾Ð»Ð½Ð¸ÑÑ â
                        </button>
                      </div>
                    )}
                    <button onClick={handleSettingsClick} className="flex items-center gap-3 px-4 py-3.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-left hover:bg-white/[0.07] transition-all">
                      <span className="text-xl">âï¸</span>
                      <div>
                        <div className="text-white/80 text-sm font-medium">ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ¸</div>
                        <div className="text-white/30 text-xs">{authed ? "API ÐºÐ»ÑÑÐ¸, GitHub, Ð¼Ð¾Ð´ÐµÐ»Ñ" : "Ð¢Ð¾Ð»ÑÐºÐ¾ Ð´Ð»Ñ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ°"}</div>
                      </div>
                      <span className="text-white/20 ml-auto">â</span>
                    </button>
                    {authed && (
                      <button onClick={logout} className="flex items-center gap-3 px-4 py-3.5 bg-red-500/[0.05] border border-red-500/20 rounded-xl text-left hover:bg-red-500/[0.10] transition-all">
                        <span className="text-xl">ðª</span>
                        <div>
                          <div className="text-red-400 text-sm font-medium">ÐÑÐ¹ÑÐ¸ Ð¸Ð· ÑÐµÐ¶Ð¸Ð¼Ð° Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ°</div>
                          <div className="text-white/30 text-xs">ÐÐ°Ð²ÐµÑÑÐ¸ÑÑ ÑÐµÑÑÐ¸Ñ</div>
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <BottomNav active={activeTab} onChange={setActiveTab} />

          <SettingsDrawer
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            settings={settings}
            onSave={handleSaveSettings}
            ghSettings={ghSettings}
            onSaveGh={saveGhSettings}
            selfEditMode={selfEditMode}
            onSelfEditToggle={handleSelfEditToggle}
            publicAiEnabled={publicAiEnabled}
            onPublicAiToggle={handlePublicAiToggle}
            onSyncEngine={handleSyncEngine}
            syncingEngine={syncingEngine}
            onLoadZip={() => zipInputRef.current?.click()}
            convertingZip={convertingZip}
          />

          <PaywallModal
            open={paywallOpen}
            onClose={() => setPaywallOpen(false)}
            freeRequestsLeft={muraveyBalance?.free_requests_left ?? 0}
            onCreatePayment={createPayment}
            onCheckPayment={checkPayment}
            onConfirmTest={confirmTestPayment}
            onRestoreByEmail={restoreByEmail}
            onPaid={() => { fetchBalance(); setPaywallOpen(false); }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
