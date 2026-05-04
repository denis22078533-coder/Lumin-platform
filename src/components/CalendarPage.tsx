import { useState } from "react";
import Icon from "@/components/ui/icon";

const MONTHS = ["Ð¯Ð½Ð²", "Ð¤ÐµÐ²", "ÐÐ°Ñ", "ÐÐ¿Ñ", "ÐÐ°Ð¹", "ÐÑÐ½", "ÐÑÐ»", "ÐÐ²Ð³", "Ð¡ÐµÐ½", "ÐÐºÑ", "ÐÐ¾Ñ", "ÐÐµÐº"];

const SCHEDULE = [
  {
    month: "ÐÐÐ ÐÐÐ¬ 2026",
    monthIdx: 3,
    events: [
      { day: "12", dayName: "ÐÑ", title: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´ÑÐºÐ¸Ð¹ ÑÐ½Ð´ÑÑÐ¾-Ð¼Ð°ÑÐ°ÑÐ¾Ð½", location: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´", sport: "Ð­Ð½Ð´ÑÑÐ¾", status: "live", time: "09:00" },
      { day: "19", dayName: "ÐÑ", title: "ÐÑÐºÑÑÑÑÐµ ÑÐ¾ÑÐµÐ²Ð½. Ð¿Ð¾ Ð¼Ð¾ÑÐ¾ÐºÑÐ¾ÑÑÑ", location: "ÐÐµÐ²Ð¸Ð½Ð½Ð¾Ð¼ÑÑÑÐº", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
      { day: "26", dayName: "ÐÑ", title: "Ð Ð°Ð»Ð»Ð¸-ÑÐ¿ÑÐ¸Ð½Ñ Â«ÐÐµÑÐµÐ½Ð½Ð¸Ð¹ Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÂ»", location: "Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»Ñ", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "11:00" },
    ]
  },
  {
    month: "ÐÐÐ 2026",
    monthIdx: 4,
    events: [
      { day: "03", dayName: "ÐÑ", title: "ÐÑÐ±Ð¾Ðº Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑ â ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ (Ð­ÑÐ°Ð¿ I)", location: "Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»Ñ", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
      { day: "10", dayName: "ÐÑ", title: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸ Â«ÐÑÐµÐ´Ð³Ð¾ÑÑÐµÂ» (Ð»ÑÐ±Ð¸Ñ.)", location: "ÐÑÑÐ¸Ð³Ð¾ÑÑÐº", sport: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸", status: "upcoming", time: "09:30" },
      { day: "17", dayName: "Ð¡Ð±", title: "Ð Ð°Ð»Ð»Ð¸ Â«ÐÑÐ±Ð°Ð½ÑÐºÐ¸Ðµ Ð¿ÑÐ¾ÑÑÐ¾ÑÑÂ» â Ð¡Ð£ 1â2", location: "ÐÑÐ¼Ð°Ð²Ð¸Ñ", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "10:00" },
      { day: "18", dayName: "ÐÑ", title: "Ð Ð°Ð»Ð»Ð¸ Â«ÐÑÐ±Ð°Ð½ÑÐºÐ¸Ðµ Ð¿ÑÐ¾ÑÑÐ¾ÑÑÂ» â Ð¤Ð¸Ð½Ð°Ð»", location: "ÐÑÐ¼Ð°Ð²Ð¸Ñ", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "14:00" },
      { day: "24", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ Ð¡ÐÐ¤Ð (Ð­ÑÐ°Ð¿ II)", location: "ÐÑÐ¹Ð½Ð°ÐºÑÐº", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:30" },
    ]
  },
  {
    month: "ÐÐ®ÐÐ¬ 2026",
    monthIdx: 5,
    events: [
      { day: "07", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ½Ð¾Ð¹ Ð´ÑÐ¸ÑÑ â ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ (Ð­ÑÐ°Ð¿ I)", location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ", sport: "ÐÑÐ¸ÑÑ", status: "upcoming", time: "20:00" },
      { day: "13", dayName: "Ð¡Ð±", title: "Ð­Ð½Ð´ÑÑÐ¾ Â«ÐÐ°Ð²ÐºÐ°Ð· Ð¢ÑÐ¾ÑÐ¸Â» (ÐºÐ¾Ð¼Ð°Ð½Ð´Ð½ÑÐ¹)", location: "ÐÐµÑÐ¼Ð¾Ð½ÑÐ¾Ð², ÐÐÐ", sport: "Ð­Ð½Ð´ÑÑÐ¾", status: "upcoming", time: "08:00" },
      { day: "14", dayName: "ÐÑ", title: "ÐÑÐ±Ð¾Ðº Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÑ â ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ (Ð­ÑÐ°Ð¿ II)", location: "ÐÐ¸ÑÐ°Ð¹Ð»Ð¾Ð²ÑÐº", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
      { day: "28", dayName: "ÐÑ", title: "Ð­Ð½Ð´ÑÑÐ¾-ÑÐ¿ÑÐ¸Ð½Ñ Â«Ð¡ÑÐµÐ¿Ð½Ð¾Ð¹ Ð²ÐµÑÐµÑÂ»", location: "ÐÑÐ´ÑÐ½Ð½Ð¾Ð²ÑÐº", sport: "Ð­Ð½Ð´ÑÑÐ¾", status: "upcoming", time: "09:00" },
      { day: "29", dayName: "ÐÐ½", title: "Ð­Ð½Ð´ÑÑÐ¾-ÑÐ¿ÑÐ¸Ð½Ñ â ÐÐµÐ½Ñ 2 / ÐÐ°Ð³ÑÐ°Ð¶Ð´ÐµÐ½Ð¸Ðµ", location: "ÐÑÐ´ÑÐ½Ð½Ð¾Ð²ÑÐº", sport: "Ð­Ð½Ð´ÑÑÐ¾", status: "upcoming", time: "10:00" },
    ]
  },
  {
    month: "ÐÐ®ÐÐ¬ 2026",
    monthIdx: 6,
    events: [
      { day: "05", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ Ð¡ÐÐ¤Ð (Ð­ÑÐ°Ð¿ III)", location: "Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»Ñ", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
      { day: "12", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ½Ð¾Ð¹ Ð´ÑÐ¸ÑÑ â ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ (Ð­ÑÐ°Ð¿ II)", location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ", sport: "ÐÑÐ¸ÑÑ", status: "upcoming", time: "20:00" },
      { day: "19", dayName: "ÐÑ", title: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸ Â«ÐÐ°Ð²ÐºÐ°Ð·ÑÐºÐ¸Ðµ ÑÐ¾Ð»Ð¼ÑÂ»", location: "ÐÐ¸ÑÐ»Ð¾Ð²Ð¾Ð´ÑÐº", sport: "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸", status: "upcoming", time: "09:30" },
    ]
  },
  {
    month: "ÐÐÐÐ£Ð¡Ð¢ 2026",
    monthIdx: 7,
    events: [
      { day: "08", dayName: "Ð¡Ð±", title: "Ð Ð°Ð»Ð»Ð¸ Â«Ð§ÑÑÐ½Ð¾Ðµ Ð¼Ð¾ÑÐµ â ÐÑÐ±Ð°Ð½ÑÂ» (Ð¡Ð£ 1)", location: "ÐÐ¾Ð²Ð¾ÑÐ¾ÑÑÐ¸Ð¹ÑÐº", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "09:00" },
      { day: "09", dayName: "ÐÑ", title: "Ð Ð°Ð»Ð»Ð¸ Â«Ð§ÑÑÐ½Ð¾Ðµ Ð¼Ð¾ÑÐµ â ÐÑÐ±Ð°Ð½ÑÂ» (Ð¤Ð¸Ð½Ð°Ð»)", location: "ÐÐµÐ»ÐµÐ½Ð´Ð¶Ð¸Ðº", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "13:00" },
      { day: "23", dayName: "ÐÑ", title: "ÐÑÐ±Ð¾Ðº Ð¡ÐÐ¤Ð Ð¿Ð¾ Ð¼Ð¾ÑÐ¾ÐºÑÐ¾ÑÑÑ â Ð¤Ð¸Ð½Ð°Ð»", location: "Ð¡Ð²ÐµÑÐ»Ð¾Ð³ÑÐ°Ð´", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
    ]
  },
  {
    month: "Ð¡ÐÐÐ¢Ð¯ÐÐ Ð¬ 2026",
    monthIdx: 8,
    events: [
      { day: "06", dayName: "ÐÑ", title: "Ð­Ð½Ð´ÑÑÐ¾ Â«ÐÑÐµÐ½Ð½Ð¸Ð¹ Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÂ»", location: "ÐÐ·Ð¾Ð±Ð¸Ð»ÑÐ½ÑÐ¹", sport: "Ð­Ð½Ð´ÑÑÐ¾", status: "upcoming", time: "09:00" },
      { day: "13", dayName: "ÐÑ", title: "Ð Ð°Ð»Ð»Ð¸ Â«ÐÐ½Ð°Ð¿ÑÐºÐ¸Ð¹ Ð±ÐµÑÐµÐ³Â»", location: "ÐÐ½Ð°Ð¿Ð°", sport: "Ð Ð°Ð»Ð»Ð¸", status: "upcoming", time: "10:00" },
      { day: "27", dayName: "ÐÑ", title: "Ð¤Ð¸Ð½Ð°Ð» ÐÑÐ±ÐºÐ° ÐÑÐ°ÑÐ½Ð¾Ð´Ð°ÑÑÐºÐ¾Ð³Ð¾ ÐºÑ. Ð¿Ð¾ Ð´ÑÐ¸ÑÑÑ", location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ", sport: "ÐÑÐ¸ÑÑ", status: "upcoming", time: "18:00" },
    ]
  },
  {
    month: "ÐÐÐ¢Ð¯ÐÐ Ð¬ 2026",
    monthIdx: 9,
    events: [
      { day: "04", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ â ÐÐ°ÐºÑÑÑÐ¸Ðµ ÑÐµÐ·Ð¾Ð½Ð° Ð¡ÐÐ¤Ð", location: "Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»Ñ", sport: "ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ", status: "upcoming", time: "10:00" },
      { day: "18", dayName: "ÐÑ", title: "ÐÐ¾ÑÐ¾ÑÐµÑÑ ÐÑÐ±Ð°Ð½Ñ â ÐÐ°ÐºÑÑÑÐ¸Ðµ ÑÐµÐ·Ð¾Ð½Ð°", location: "ÐÑÐ°ÑÐ½Ð¾Ð´Ð°Ñ", sport: "ÐÑÐ¸ÑÑ", status: "upcoming", time: "16:00" },
    ]
  },
];

const sportColors: Record<string, string> = {
  Ð­Ð½Ð´ÑÑÐ¾: "bg-fire text-white",
  ÐÐ¾ÑÐ¾ÐºÑÐ¾ÑÑ: "bg-orange-600 text-white",
  Ð Ð°Ð»Ð»Ð¸: "bg-yellow-600 text-white",
  ÐÑÐ¸ÑÑ: "bg-purple-700 text-white",
  "ÐÑÐ¾ÑÑ-ÐºÐ°Ð½ÑÑÐ¸": "bg-green-700 text-white",
};

export default function CalendarPage() {
  const [activeMonth, setActiveMonth] = useState(3);

  const filtered = SCHEDULE.filter(s => s.monthIdx === activeMonth);
  const display = filtered.length > 0 ? filtered : SCHEDULE;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold tracking-widest text-white">ÐÐÐÐÐÐÐÐ Ð¬</h1>
          <p className="text-muted-foreground text-xs font-roboto mt-0.5">Ð¡ÑÐ°Ð²ÑÐ¾Ð¿Ð¾Ð»ÑÐµ Ð¸ ÐÑÐ±Ð°Ð½Ñ Â· 2026</p>
        </div>
        <div className="flex items-center gap-1.5 bg-fire/10 border border-fire/30 px-3 py-1.5 rounded-lg">
          <Icon name="MapPin" size={13} className="text-fire" />
          <span className="text-fire text-xs font-oswald font-bold">Ð¡ÐÐ¤Ð Â· Ð®Ð¤Ð</span>
        </div>
      </div>

      {/* Month scroll */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {MONTHS.map((m, i) => {
          const hasEvents = SCHEDULE.some(s => s.monthIdx === i);
          return (
            <button
              key={m}
              onClick={() => setActiveMonth(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-oswald font-semibold tracking-wide transition-colors relative ${
                activeMonth === i
                  ? "fire-gradient text-white"
                  : "bg-secondary text-muted-foreground hover:text-white"
              }`}
            >
              {m}
              {hasEvents && activeMonth !== i && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-fire rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {Object.entries(sportColors).map(([sport, cls]) => (
          <span key={sport} className={`flex-shrink-0 ${cls} text-[10px] font-oswald font-bold px-2 py-0.5 rounded tracking-wider`}>
            {sport}
          </span>
        ))}
      </div>

      {/* Schedule */}
      <div className="px-4 flex flex-col gap-6">
        {display.map((section) => (
          <div key={section.month}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-oswald text-fire font-bold tracking-widest text-sm">{section.month}</span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-roboto">{section.events.length} ÑÐ¾Ð±ÑÑÐ¸Ð¹</span>
            </div>

            <div className="flex flex-col gap-2">
              {section.events.map((ev, i) => (
                <div
                  key={i}
                  className={`animate-fade-in opacity-0 stagger-${Math.min(i + 1, 5)} flex gap-3 items-stretch cursor-pointer group`}
                >
                  <div className={`flex-shrink-0 w-12 rounded-xl flex flex-col items-center justify-center py-2 ${ev.status === 'live' ? 'fire-gradient' : 'bg-secondary'}`}>
                    <span className="font-oswald font-bold text-xl text-white leading-none">{ev.day}</span>
                    <span className={`text-xs font-roboto ${ev.status === 'live' ? 'text-white/80' : 'text-muted-foreground'}`}>{ev.dayName}</span>
                  </div>

                  <div className={`flex-1 rounded-xl p-3 border ${ev.status === 'live' ? 'border-fire/30 bg-fire/5' : 'border-border bg-card'} group-hover:border-fire/40 transition-colors`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-oswald font-bold px-1.5 py-0.5 rounded tracking-wider ${sportColors[ev.sport] || 'bg-secondary text-white'}`}>
                            {ev.sport}
                          </span>
                          {ev.status === 'live' && (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-oswald font-bold">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-white text-sm font-roboto font-medium leading-tight">{ev.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1 text-muted-foreground text-xs font-roboto">
                            <Icon name="MapPin" size={11} />
                            {ev.location}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground text-xs font-roboto">
                            <Icon name="Clock" size={11} />
                            {ev.time}
                          </span>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-fire transition-colors mt-0.5 flex-shrink-0">
                        <Icon name="BellPlus" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
