import { useState } from "react";
import Icon from "@/components/ui/icon";

const IMG = {
  enduro: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  rally: "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=800&q=80",
  moto: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
  drift: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
};

const CATEGORIES = ["ÐÑÐµ", "Ð­Ð½Ð´ÑÑÐ¾", "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", "Ð Ð°Ð»Ð»Ð¸", "ÐÑÐ¸ÑÑ", "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸"];

const ALL_EVENTS = [
  {
    id: 1,
    title: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´ÑÐºÐ¸Ð¹ ÑÐ½Ð´ÑÑÐ¾-Ð¼Ð°ÑÐ°ÑÐ¾Ð½",
    sport: "Ð­Ð½Ð´ÑÑÐ¾",
    date: "12 Ð°Ð¿Ñ 2026",
    location: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´, Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑÐºÐ¸Ð¹ ÐºÑ.",
    status: "live",
    statusText: "LIVE",
    participants: "84 Ð³Ð¾Ð½ÑÐ¸ÐºÐ°",
    image: IMG.enduro,
    viewers: "2.4K",
    desc: "ÐÑÐºÑÑÑÑÐ¹ ÑÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°Ñ Ð¡ÐÐ¤Ð Ð¿Ð¾ ÑÐ½Ð´ÑÑÐ¾",
  },
  {
    id: 2,
    title: "ÐÑÐ±Ð¾Ðº Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑ â ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ",
    sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ",
    date: "3 Ð¼Ð°Ñ 2026",
    location: "Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»Ñ, ÑÑÐ°ÑÑÐ° Â«Ð¡ÑÐµÐ¿Ð½Ð°ÑÂ»",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "60 Ð³Ð¾Ð½ÑÐ¸ÐºÐ¾Ð²",
    image: IMG.moto,
    viewers: null,
    desc: "Ð­ÑÐ°Ð¿ I ÐºÑÐ°ÐµÐ²Ð¾Ð³Ð¾ ÐºÑÐ±ÐºÐ° Ð¿Ð¾ Ð¼Ð¾ÑÐ¾ÐºÑÐ¾ÑÑÑ ÑÑÐµÐ´Ð¸ Ð²Ð·ÑÐ¾ÑÐ»ÑÑ Ð¸ ÑÐ½Ð¸Ð¾ÑÐ¾Ð²",
  },
  {
    id: 3,
    title: "Ð Ð°Ð»Ð»Ð¸ Â«ÐÑÐ±Ð°Ð½ÑÐºÐ¸Ðµ Ð¿ÑÐ¾ÑÑÐ¾ÑÑÂ»",
    sport: "Ð Ð°Ð»Ð»Ð¸",
    date: "17â18 Ð¼Ð°Ñ 2026",
    location: "ÐÑÐ¼Ð°Ð²Ð¸Ñ, ÐÑÐ°ÑÐ½Ð¾Ð´Ð°ÑÑÐºÐ¸Ð¹ ÐºÑ.",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "45 ÑÐºÐ¸Ð¿Ð°Ð¶ÐµÐ¹",
    image: IMG.rally,
    viewers: null,
    desc: "ÐÐ¶ÐµÐ³Ð¾Ð´Ð½Ð¾Ðµ ÑÐ°Ð»Ð»Ð¸ Ð¿Ð¾ Ð´Ð¾ÑÐ¾Ð³Ð°Ð¼ ÐÑÐ±Ð°Ð½Ð¸ â 3 Ð¡Ð£, Ð¾Ð±ÑÐ¸Ð¹ Ð·Ð°ÑÑÑ 240 ÐºÐ¼",
  },
  {
    id: 4,
    title: "ÐÐ¾ÑÐ½Ð¾Ð¹ Ð´ÑÐ¸ÑÑ â ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ",
    sport: "ÐÑÐ¸ÑÑ",
    date: "7 Ð¸ÑÐ½Ñ 2026",
    location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ, Ð°Ð²ÑÐ¾Ð´ÑÐ¾Ð¼ Â«Ð®Ð¶Ð½ÑÐ¹Â»",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "32 Ð¿Ð¸Ð»Ð¾ÑÐ°",
    image: IMG.drift,
    viewers: null,
    desc: "Ð¤Ð¸Ð½Ð°Ð» ÐºÑÐ°ÐµÐ²ÑÑ ÑÐ¾ÑÐµÐ²Ð½Ð¾Ð²Ð°Ð½Ð¸Ð¹ Ð¿Ð¾ Ð´ÑÐ¸ÑÑÑ Ð¿ÑÐ¸ ÑÐ²ÐµÑÐµ Ð¿ÑÐ¾Ð¶ÐµÐºÑÐ¾ÑÐ¾Ð²",
  },
  {
    id: 5,
    title: "Ð­Ð½Ð´ÑÑÐ¾-ÑÐ¿ÑÐ¸Ð½Ñ Â«Ð¡ÑÐµÐ¿Ð½Ð¾Ð¹ Ð²ÐµÑÐµÑÂ»",
    sport: "Ð­Ð½Ð´ÑÑÐ¾",
    date: "28â29 Ð¸ÑÐ½Ñ 2026",
    location: "ÐÑÐ´ÑÐ½Ð½Ð¾Ð²ÑÐº, Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑÐºÐ¸Ð¹ ÐºÑ.",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "70 Ð³Ð¾Ð½ÑÐ¸ÐºÐ¾Ð²",
    image: IMG.enduro,
    viewers: null,
    desc: "Ð¡ÐºÐ¾ÑÐ¾ÑÑÐ½Ð¾Ð¹ ÑÐ¿ÑÐ¸Ð½Ñ Ð¿Ð¾ ÑÑÐµÐ¿Ð½ÑÐ¼ ÑÑÐ¾Ð¿Ð°Ð¼ ÐÑÐ´ÑÐ½Ð½Ð¾Ð²ÑÐºÐ¾Ð³Ð¾ ÑÐ°Ð¹Ð¾Ð½Ð°",
  },
  {
    id: 6,
    title: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸ Â«ÐÐ°Ð²ÐºÐ°Ð·ÑÐºÐ¸Ðµ ÑÐ¾Ð»Ð¼ÑÂ»",
    sport: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸",
    date: "19 Ð¸ÑÐ»Ñ 2026",
    location: "ÐÐ¸ÑÐ»Ð¾Ð²Ð¾Ð´ÑÐº, Ð¿ÑÐµÐ´Ð³Ð¾ÑÑÐµ ÐÐÐ",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "38 ÑÐºÐ¸Ð¿Ð°Ð¶ÐµÐ¹",
    image: IMG.rally,
    viewers: null,
    desc: "ÐÐ¾ÑÐ½Ð°Ñ Ð³Ð¾Ð½ÐºÐ° Ñ Ð½Ð°Ð±Ð¾ÑÐ¾Ð¼ Ð²ÑÑÐ¾ÑÑ Ñ ÐÐ°Ð²ÐºÐ°Ð·ÑÐºÐ¸Ñ ÐÐ¸Ð½ÐµÑÐ°Ð»ÑÐ½ÑÑ ÐÐ¾Ð´",
  },
  {
    id: 7,
    title: "ÐÑÐ±Ð¾Ðº Ð¡ÐÐ¤Ð Ð¿Ð¾ Ð¼Ð¾ÑÐ¾ÐºÑÐ¾ÑÑÑ â Ð¤Ð¸Ð½Ð°Ð»",
    sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ",
    date: "23 Ð°Ð²Ð³ 2026",
    location: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´, Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑÐºÐ¸Ð¹ ÐºÑ.",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "90 Ð³Ð¾Ð½ÑÐ¸ÐºÐ¾Ð²",
    image: IMG.moto,
    viewers: null,
    desc: "Ð¤Ð¸Ð½Ð°Ð»ÑÐ½ÑÐ¹ ÑÑÐ°Ð¿ ÑÐµÐ¼Ð¿Ð¸Ð¾Ð½Ð°ÑÐ° Ð¡ÐÐ¤Ð: Ð²Ð·ÑÐ¾ÑÐ»ÑÐµ, ÑÐ½Ð¸Ð¾ÑÑ, Ð¶ÐµÐ½ÑÐ¸Ð½Ñ",
  },
  {
    id: 8,
    title: "Ð Ð°Ð»Ð»Ð¸ Â«ÐÐ½Ð°Ð¿ÑÐºÐ¸Ð¹ Ð±ÐµÑÐµÐ³Â»",
    sport: "Ð Ð°Ð»Ð»Ð¸",
    date: "13 ÑÐµÐ½Ñ 2026",
    location: "ÐÐ½Ð°Ð¿Ð°, ÐÑÐ°ÑÐ½Ð¾Ð´Ð°ÑÑÐºÐ¸Ð¹ ÐºÑ.",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "28 ÑÐºÐ¸Ð¿Ð°Ð¶ÐµÐ¹",
    image: IMG.rally,
    viewers: null,
    desc: "ÐÑÐ°Ð²Ð¸Ð¹Ð½Ð¾Ðµ ÑÐ°Ð»Ð»Ð¸ Ð²Ð´Ð¾Ð»Ñ ÑÐµÑÐ½Ð¾Ð¼Ð¾ÑÑÐºÐ¾Ð³Ð¾ Ð¿Ð¾Ð±ÐµÑÐµÐ¶ÑÑ â 2 ÑÐ¿ÐµÑÑÑÐ°ÑÑÐºÐ°",
  },
  {
    id: 9,
    title: "ÐÐ°ÐºÑÑÑÐ¸Ðµ ÑÐµÐ·Ð¾Ð½Ð° â ÐÐ¾ÑÐ¾ÑÐµÑÑ ÐÑÐ±Ð°Ð½Ñ",
    sport: "ÐÑÐ¸ÑÑ",
    date: "18 Ð¾ÐºÑ 2026",
    location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ, ÑÑÐ°Ð´Ð¸Ð¾Ð½ Â«ÐÑÐ±Ð°Ð½ÑÂ»",
    status: "upcoming",
    statusText: "Ð¡ÐÐÐ Ð",
    participants: "50+ Ð¿Ð¸Ð»Ð¾ÑÐ¾Ð²",
    image: IMG.drift,
    viewers: null,
    desc: "ÐÐ°Ð»Ð°-ÑÐµÑÑÐ¸Ð²Ð°Ð»Ñ Ð·Ð°ÐºÑÑÑÐ¸Ñ ÑÐµÐ·Ð¾Ð½Ð°: Ð´ÑÐ¸ÑÑ, ÑÐ¾Ñ-Ð¿ÑÐ¾Ð³ÑÐ°Ð¼Ð¼Ð°, Ð½Ð°Ð³ÑÐ°Ð¶Ð´ÐµÐ½Ð¸Ðµ",
  },
];

const statusConfig: Record<string, { bg: string; text: string }> = {
  live: { bg: "bg-red-600", text: "text-white" },
  upcoming: { bg: "bg-fire/20 border border-fire/40", text: "text-fire" },
  finished: { bg: "bg-secondary", text: "text-muted-foreground" },
};

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState("ÐÑÐµ");

  const filtered = activeCategory === "ÐÑÐµ"
    ? ALL_EVENTS
    : ALL_EVENTS.filter(e => e.sport === activeCategory);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-oswald text-2xl font-bold tracking-widest text-white">ÐÐÐ ÐÐÐ ÐÐ¯Ð¢ÐÐ¯</h1>
        <p className="text-muted-foreground text-xs font-roboto mt-0.5">Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÐµ Ð¸ ÐÑÐ±Ð°Ð½Ñ Â· Ð¡ÐµÐ·Ð¾Ð½ 2026</p>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-oswald font-semibold tracking-wide transition-colors ${
              activeCategory === cat
                ? "fire-gradient text-white"
                : "bg-secondary text-muted-foreground hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="px-4 mb-2">
        <span className="text-muted-foreground text-xs font-roboto">{filtered.length} ÑÐ¾Ð±ÑÑÐ¸Ð¹</span>
      </div>

      {/* Events grid */}
      <div className="px-4 flex flex-col gap-3">
        {filtered.map((ev, i) => {
          const cfg = statusConfig[ev.status];
          return (
            <div
              key={ev.id}
              className={`animate-fade-in stagger-${Math.min(i + 1, 5)} opacity-0 rounded-xl overflow-hidden bg-card border border-border card-hover cursor-pointer`}
            >
              <div className="relative h-40 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className={`${cfg.bg} ${cfg.text} text-xs font-oswald font-bold px-2 py-1 rounded tracking-wider flex items-center gap-1.5`}>
                    {ev.status === "live" && <span className="w-1.5 h-1.5 bg-white rounded-full live-pulse" />}
                    {ev.statusText}
                  </span>
                </div>

                {ev.viewers && (
                  <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="Eye" size={12} className="text-white/70" />
                    <span className="text-white text-xs font-roboto">{ev.viewers}</span>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-fire text-xs font-oswald font-bold tracking-wider">{ev.sport.toUpperCase()}</span>
                  <h3 className="font-oswald text-white text-lg font-bold leading-tight mt-0.5">{ev.title}</h3>
                  <p className="text-white/70 text-xs font-roboto mt-0.5 line-clamp-1">{ev.desc}</p>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="MapPin" size={13} />
                    <span className="text-xs font-roboto">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="Calendar" size={13} />
                    <span className="text-xs font-roboto">{ev.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <Icon name="Users" size={13} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-roboto">{ev.participants}</span>
                  </div>
                  <button className="flex items-center gap-1 text-fire text-xs font-oswald font-bold hover:opacity-70 transition-opacity">
                    <Icon name="BellPlus" size={13} />
                    ÐÐ°Ð¿Ð¾Ð¼Ð½Ð¸ÑÑ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
