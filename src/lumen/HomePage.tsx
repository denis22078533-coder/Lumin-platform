import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onGoToChat: () => void;
  onGoToProjects: () => void;
  onGoToProfile: () => void;
}

const BANNERS = [
  {
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
    overlay: "from-black/75 via-[#7c3aed]/30 to-transparent",
    tag: "ð ÐÐ½ÑÐµÑÐ½ÐµÑ-Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ñ",
    title: "ÐÐ°Ð³Ð°Ð·Ð¸Ð½ Ð·Ð° 5 Ð¼Ð¸Ð½ÑÑ",
    subtitle: "ÐÐ°ÑÐ°Ð»Ð¾Ð³, ÐºÐ¾ÑÐ·Ð¸Ð½Ð°, Ð¾Ð¿Ð»Ð°ÑÐ°, Ð´Ð¾ÑÑÐ°Ð²ÐºÐ° â Ð²ÑÑ Ð¿Ð¾Ð´ ÐºÐ»ÑÑ",
    accent: "#a855f7",
  },
  {
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200&q=80",
    overlay: "from-black/75 via-[#1d4ed8]/30 to-transparent",
    tag: "ð Ð¨ÐºÐ¾Ð»ÑÐ½ÑÐµ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ñ",
    title: "Ð§Ð°Ñ Ð´Ð»Ñ ÐºÐ»Ð°ÑÑÐ°",
    subtitle: "Ð Ð°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ, Ð·Ð°Ð´Ð°Ð½Ð¸Ñ, ÑÐ°Ñ ÑÑÐ¸ÑÐµÐ»ÐµÐ¹ Ð¸ ÑÑÐµÐ½Ð¸ÐºÐ¾Ð²",
    accent: "#3b82f6",
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
    overlay: "from-black/75 via-[#0d9488]/30 to-transparent",
    tag: "ð¼ ÐÐ»Ñ Ð±Ð¸Ð·Ð½ÐµÑÐ°",
    title: "Ð¡Ð°Ð¹Ñ ÐºÐ¾Ð¼Ð¿Ð°Ð½Ð¸Ð¸",
    subtitle: "ÐÐ½Ð°Ð»Ð¸ÑÐ¸ÐºÐ°, CRM, Ð·Ð°ÑÐ²ÐºÐ¸ â Ð²ÑÑ Ð² Ð¾Ð´Ð½Ð¾Ð¼ Ð´Ð°ÑÐ±Ð¾ÑÐ´Ðµ",
    accent: "#14b8a6",
  },
  {
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    overlay: "from-black/75 via-[#ec4899]/25 to-transparent",
    tag: "ð AI-ÑÐ°Ð·ÑÐ°Ð±Ð¾ÑÐºÐ°",
    title: "Ð¡Ð°Ð¹ÑÑ Ð·Ð° Ð¼Ð¸Ð½ÑÑÑ",
    subtitle: "ÐÐ¿Ð¸ÑÐ¸ÑÐµ Ð¸Ð´ÐµÑ â ÐÑÑÐ°Ð²ÐµÐ¹ Ð¿Ð¾ÑÑÑÐ¾Ð¸Ñ Ð±ÐµÐ· ÐµÐ´Ð¸Ð½Ð¾Ð¹ ÑÑÑÐ¾ÐºÐ¸ ÐºÐ¾Ð´Ð°",
    accent: "#f43f5e",
  },
  {
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    overlay: "from-black/75 via-[#f59e0b]/25 to-transparent",
    tag: "ð± ÐÐ¾Ð±Ð¸Ð»ÑÐ½ÑÐµ Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ",
    title: "ÐÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ Ð»ÑÐ±Ð¾Ð¹ ÑÐ»Ð¾Ð¶Ð½Ð¾ÑÑÐ¸",
    subtitle: "ÐÑ Ð»ÐµÐ½Ð´Ð¸Ð½Ð³Ð° Ð´Ð¾ Ð¿Ð¾Ð»Ð½Ð¾ÑÐµÐ½Ð½Ð¾Ð³Ð¾ Ð²ÐµÐ±-Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ñ Ñ Ð±Ð°Ð·Ð¾Ð¹ Ð´Ð°Ð½Ð½ÑÑ",
    accent: "#f59e0b",
  },
];

const FEATURES = [
  { emoji: "â¡", title: "ÐÐ¾Ð»Ð½Ð¸ÐµÐ½Ð¾ÑÐ½Ð¾", desc: "Ð¡Ð°Ð¹Ñ Ð³Ð¾ÑÐ¾Ð² Ð·Ð° 30 ÑÐµÐºÑÐ½Ð´" },
  { emoji: "ð§ ", title: "Ð£Ð¼Ð½ÑÐ¹ ÐÐ", desc: "ÐÐ¾Ð½Ð¸Ð¼Ð°ÐµÑ Ð²Ð°Ñ Ð±Ð¸Ð·Ð½ÐµÑ" },
  { emoji: "ð", title: "ÐÐ°Ð´ÑÐ¶Ð½Ð¾", desc: "Ð¥Ð¾ÑÑÐ¸Ð½Ð³ Ð¸ SSL Ð²ÐºÐ»ÑÑÐµÐ½Ñ" },
  { emoji: "ð", title: "ÐÐ°ÑÑÑÐ°Ð±Ð¸ÑÑÐµÐ¼Ð¾", desc: "Ð Ð°ÑÑÑÑ Ð²Ð¼ÐµÑÑÐµ Ñ Ð²Ð°Ð¼Ð¸" },
];

// ÐÑÑÐ°Ð²ÑÐ¸ Ð´Ð»Ñ Ð°Ð½Ð¸Ð¼Ð°ÑÐ¸Ð¸ Ð½Ð° ÑÐ¾Ð½Ðµ
const ANTS = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  y: 30 + i * 10,
  duration: 8 + i * 1.5,
  delay: i * 1.2,
  size: 14 + (i % 3) * 4,
  reverse: i % 2 === 0,
}));

function AntBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* ÐÐ¾Ð¼Ð¸Ðº â ÑÐ¸Ð»ÑÑÑ SVG */}
      <div className="absolute bottom-0 right-4 opacity-20">
        <svg width="90" height="80" viewBox="0 0 90 80" fill="none">
          <polygon points="45,5 85,38 75,38 75,75 15,75 15,38 5,38" fill="#f59e0b" opacity="0.7"/>
          <rect x="33" y="50" width="24" height="25" fill="#d97706" opacity="0.8"/>
          <rect x="12" y="36" width="66" height="4" fill="#fbbf24" opacity="0.5"/>
        </svg>
      </div>
      {/* ÐÐ¸ÑÐ¿Ð¸ÑÐ¸ */}
      {[{x:62,y:62},{x:68,y:55},{x:74,y:62}].map((b,i) => (
        <div key={i} className="absolute opacity-15" style={{left: `${b.x}%`, bottom: `${b.y}px`}}>
          <div className="w-5 h-3 bg-[#f59e0b] rounded-sm border border-[#d97706]" />
        </div>
      ))}
      {/* ÐÐµÐ³ÑÑÐ¸Ðµ Ð¼ÑÑÐ°Ð²ÑÐ¸ */}
      {ANTS.map(ant => (
        <motion.div
          key={ant.id}
          className="absolute"
          style={{ bottom: `${ant.y}px`, fontSize: ant.size }}
          animate={ant.reverse
            ? { x: ["100vw", "-60px"] }
            : { x: ["-60px", "100vw"] }
          }
          transition={{
            duration: ant.duration,
            delay: ant.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span
            style={{ display: "inline-block", transform: ant.reverse ? "scaleX(-1)" : undefined, opacity: 0.18 }}
          >
            ð
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Ð¥ÑÐº Ð°Ð²ÑÐ¾Ð¿ÑÐ¾ÐºÑÑÑÐºÐ¸ â ÑÐ±ÑÐ°ÑÑÐ²Ð°ÐµÑ ÑÐ°Ð¹Ð¼ÐµÑ Ð¿ÑÐ¸ ÑÑÑÐ½Ð¾Ð¹ ÑÐ¼ÐµÐ½Ðµ ÑÐ»Ð°Ð¹Ð´Ð°
function useAutoplay(total: number, interval = 4000) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, interval);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, interval]);

  const goTo = (i: number) => {
    setCurrent(i);
    startTimer(); // ÑÐ±ÑÐ°ÑÑÐ²Ð°ÐµÐ¼ ÑÐ°Ð¹Ð¼ÐµÑ â Ð½Ðµ Ð¿ÑÑÐ³Ð°ÐµÐ¼ ÑÑÐ°Ð·Ñ Ð¿Ð¾ÑÐ»Ðµ ÑÑÑÐ½Ð¾Ð³Ð¾ ÑÐ°Ð¿Ð°
  };

  return { current, goTo };
}

export default function HomePage({ onGoToChat, onGoToProjects: _onGoToProjects, onGoToProfile: _onGoToProfile }: Props) {
  const { current, goTo } = useAutoplay(BANNERS.length, 3800);
  const banner = BANNERS[current];

  return (
    <div className="flex flex-col h-full bg-[#07070c] overflow-y-auto pb-20 relative">

      {/* ÐÐ½Ð¸Ð¼Ð¸ÑÐ¾Ð²Ð°Ð½Ð½ÑÐ¹ ÑÐ¾Ð½ Ñ Ð¼ÑÑÐ°Ð²ÑÑÐ¼Ð¸ */}
      <AntBackground />

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] relative z-10">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center shadow-[0_0_16px_#f59e0b60] text-lg"
          >
            ð
          </motion.div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">ÐÑÑÐ°Ð²ÐµÐ¹</span>
            <div className="text-white/30 text-[9px] leading-none">AI-ÑÐ°Ð·ÑÐ°Ð±Ð¾ÑÑÐ¸Ðº</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-[10px] font-medium">ÐÐ½Ð»Ð°Ð¹Ð½</span>
        </div>
      </div>

      {/* Banner carousel Ñ ÑÐ¾ÑÐ¾ */}
      <div className="shrink-0 relative mx-3 mt-3 rounded-2xl overflow-hidden h-56">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Ð¤Ð¾ÑÐ¾ */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.overlay}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div>
                <span
                  className="text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
                  style={{ background: `${banner.accent}40`, border: `1px solid ${banner.accent}60` }}
                >
                  {banner.tag}
                </span>
              </div>
              <div>
                <h2 className="text-white text-xl font-black leading-tight mb-1 drop-shadow-lg">
                  {banner.title}
                </h2>
                <p className="text-white/80 text-xs leading-relaxed drop-shadow mb-3">
                  {banner.subtitle}
                </p>
                {/* Dots */}
                <div className="flex gap-1.5">
                  {BANNERS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: i === current ? "#fff" : "rgba(255,255,255,0.35)",
                        width: i === current ? 22 : 7,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA â ÐÐ° ÑÐ°Ð±Ð¾ÑÑ */}
      <div className="px-3 mt-4 relative z-10">
        <motion.button
          onClick={onGoToChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-2xl relative overflow-hidden flex items-center justify-center gap-3 shadow-[0_0_40px_#f59e0b50]"
          style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444, #ec4899)" }}
        >
          {/* ÐÐ»Ð¸Ðº */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
          <motion.span
            animate={{ x: [0, 5, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl relative z-10"
          >
            ð
          </motion.span>
          <span className="text-white font-black text-lg tracking-tight relative z-10">ÐÐ° ÑÐ°Ð±Ð¾ÑÑ!</span>
          <span className="text-white/70 text-xl relative z-10">â</span>
        </motion.button>
      </div>

      {/* Features */}
      <div className="px-3 mt-4 grid grid-cols-2 gap-2.5 relative z-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3.5"
          >
            <div className="text-2xl mb-1.5">{f.emoji}</div>
            <div className="text-white/90 text-sm font-semibold">{f.title}</div>
            <div className="text-white/40 text-xs mt-0.5">{f.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* ÐÑÑÑÑÑÐ¹ ÑÑÐ°ÑÑ */}
      <div className="px-3 mt-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">ÐÑÑÑÑÑÐ¹ ÑÑÐ°ÑÑ</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { icon: "ð", label: "ÐÐ½ÑÐµÑÐ½ÐµÑ-Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½", desc: "ÐºÐ°ÑÐ°Ð»Ð¾Ð³ + ÐºÐ¾ÑÐ·Ð¸Ð½Ð° + Ð¾Ð¿Ð»Ð°ÑÐ°" },
            { icon: "ð", label: "Ð¨ÐºÐ¾Ð»ÑÐ½Ð°Ñ Ð¿Ð»Ð°ÑÑÐ¾ÑÐ¼Ð°", desc: "ÑÐ°Ñ, Ð·Ð°Ð´Ð°Ð½Ð¸Ñ, ÑÐ°ÑÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ" },
            { icon: "ð¼", label: "Ð¡Ð°Ð¹Ñ Ð´Ð»Ñ Ð±Ð¸Ð·Ð½ÐµÑÐ°", desc: "ÑÑÐ»ÑÐ³Ð¸, ÑÐµÐ½Ñ, CRM, Ð·Ð°ÑÐ²ÐºÐ¸" },
            { icon: "ð", label: "Ð¡Ð°Ð¹Ñ ÑÐµÑÑÐ¾ÑÐ°Ð½Ð°", desc: "Ð¼ÐµÐ½Ñ, Ð³Ð°Ð»ÐµÑÐµÑ, Ð±ÑÐ¾Ð½Ð¸ÑÐ¾Ð²Ð°Ð½Ð¸Ðµ" },
            { icon: "ð", label: "ÐÐµÐ½Ð´Ð¸Ð½Ð³-ÑÑÐ°ÑÑÐ°Ð¿", desc: "MVP, Ð¿ÑÐµÐ·ÐµÐ½ÑÐ°ÑÐ¸Ñ, Ð¸Ð½Ð²ÐµÑÑÐ¾ÑÐ°Ð¼" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={onGoToChat}
              className="flex items-center gap-3 px-3.5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.14] active:scale-[0.98] transition-all text-left"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="min-w-0">
                <div className="text-white/80 text-sm font-medium">{item.label}</div>
                <div className="text-white/30 text-xs truncate">{item.desc}</div>
              </div>
              <span className="text-white/20 ml-auto text-sm">â</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom padding for nav */}
      <div className="h-4" />
    </div>
  );
}