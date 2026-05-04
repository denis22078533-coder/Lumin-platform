import Icon from "@/components/ui/icon";

const BREAKING = {
  title: "ÐÐÐ ÐÐÐ¡ Ð£Ð¡Ð¢ÐÐÐÐÐÐÐÐÐÐ¢ ÐÐÐÐ«Ð Ð ÐÐÐÐ Ð Ð¢Ð ÐÐ¡Ð¡Ð« Ð Ð¥ÐÐ ÐÐ¡Ð",
  time: "5 Ð¼Ð¸Ð½ÑÑ Ð½Ð°Ð·Ð°Ð´",
  sport: "MotoGP",
};

const NEWS = [
  {
    id: 1,
    title: "ÐÐµÑÑÑÐ°Ð¿Ð¿ÐµÐ½ Ð¾ Ð½Ð¾Ð²Ð¾Ð¼ ÑÐµÐ·Ð¾Ð½Ðµ: Â«Red Bull ÑÑÐ°Ð» ÐµÑÑ Ð±ÑÑÑÑÐµÐµÂ»",
    sport: "F1",
    time: "1Ñ Ð½Ð°Ð·Ð°Ð´",
    source: "F1 News",
    views: "34K",
    hot: true,
    image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&q=80",
  },
  {
    id: 2,
    title: "Sebastien Loeb Ð²Ð¾Ð·Ð²ÑÐ°ÑÐ°ÐµÑÑÑ Ð² WRC Ð½Ð° Ð¾Ð´Ð¸Ð½ ÑÑÐ°Ð¿",
    sport: "WRC",
    time: "2Ñ Ð½Ð°Ð·Ð°Ð´",
    source: "Rally World",
    views: "18K",
    hot: false,
    image: "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=800&q=80",
  },
  {
    id: 3,
    title: "KTM Ð°Ð½Ð¾Ð½ÑÐ¸ÑÐ¾Ð²Ð°Ð»Ð° ÑÐµÐ²Ð¾Ð»ÑÑÐ¸Ð¾Ð½Ð½ÑÐ¹ Ð´Ð²Ð¸Ð³Ð°ÑÐµÐ»Ñ Ð´Ð»Ñ MotoGP 2025",
    sport: "MotoGP",
    time: "4Ñ Ð½Ð°Ð·Ð°Ð´",
    source: "MotoWorld",
    views: "52K",
    hot: true,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  },
  {
    id: 4,
    title: "Ð Ð¾ÑÑÐ¸Ð¹ÑÐºÐ¸Ð¹ Ð´ÑÐ¸ÑÑ Ð½Ð°Ð±Ð¸ÑÐ°ÐµÑ Ð¾Ð±Ð¾ÑÐ¾ÑÑ: 5 ÑÑÐ°Ð¿Ð¾Ð² Ð² ÑÐµÐ·Ð¾Ð½Ðµ 2024",
    sport: "ÐÑÐ¸ÑÑ",
    time: "6Ñ Ð½Ð°Ð·Ð°Ð´",
    source: "Auto Sport RU",
    views: "9K",
    hot: false,
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  },
];

const sportColors: Record<string, string> = {
  "F1": "text-red-500",
  "WRC": "text-yellow-500",
  "MotoGP": "text-fire",
  "ÐÑÐ¸ÑÑ": "text-purple-400",
  "WSBK": "text-blue-400",
};

export default function NewsPage() {
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-oswald text-2xl font-bold tracking-widest text-white">ÐÐÐÐÐ¡Ð¢Ð</h1>
          <p className="text-muted-foreground text-xs font-roboto mt-0.5">ÐÐ¾ÑÐ»ÐµÐ´Ð½Ð¸Ðµ ÑÐ¾Ð±ÑÑÐ¸Ñ</p>
        </div>
        <button className="text-muted-foreground hover:text-white transition-colors">
          <Icon name="Search" size={22} />
        </button>
      </div>

      {/* Breaking News */}
      <div className="mx-4 mt-3 fire-gradient rounded-xl p-3 flex items-center gap-3 animate-fade-in opacity-0">
        <div className="flex-shrink-0 bg-white/20 rounded-lg px-2 py-1">
          <span className="font-oswald font-bold text-white text-xs tracking-widest">Ð¡Ð ÐÐ§ÐÐ</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-roboto font-medium leading-tight">{BREAKING.title}</p>
          <span className="text-white/70 text-xs font-roboto">{BREAKING.time}</span>
        </div>
        <Icon name="ChevronRight" size={18} className="text-white flex-shrink-0" />
      </div>

      {/* Featured news */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-oswald font-bold text-fire tracking-wider text-sm">Ð Ð¢Ð ÐÐÐÐ</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="animate-fade-in stagger-1 opacity-0 relative rounded-xl overflow-hidden cursor-pointer card-hover mb-4">
          <img src={NEWS[0].image} alt={NEWS[0].title} className="w-full h-52 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white text-xs font-oswald font-bold px-2 py-1 rounded tracking-wider flex items-center gap-1">
              ð¥ ÐÐÐ Ð¯Ð§ÐÐ
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className={`text-xs font-oswald font-bold tracking-wider ${sportColors[NEWS[0].sport] || 'text-fire'}`}>{NEWS[0].sport}</span>
            <h3 className="font-oswald text-white text-xl font-bold mt-1 leading-tight">{NEWS[0].title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-white/60 text-xs font-roboto">{NEWS[0].source}</span>
              <span className="text-white/60 text-xs font-roboto">{NEWS[0].time}</span>
              <span className="flex items-center gap-1 text-white/60 text-xs font-roboto">
                <Icon name="Eye" size={11} /> {NEWS[0].views}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* News list */}
      <div className="px-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-oswald font-bold text-muted-foreground tracking-wider text-sm">ÐÐ¡Ð ÐÐÐÐÐ¡Ð¢Ð</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {NEWS.slice(1).map((news, i) => (
          <div key={news.id} className={`animate-fade-in stagger-${i + 2} opacity-0 flex gap-3 cursor-pointer group`}>
            <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {news.hot && (
                <div className="absolute top-1 left-1">
                  <span className="text-xs">ð¥</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
              <div>
                <span className={`text-xs font-oswald font-bold tracking-wider ${sportColors[news.sport] || 'text-fire'}`}>{news.sport}</span>
                <h4 className="text-white text-sm font-roboto font-medium leading-snug mt-0.5 line-clamp-2">{news.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-roboto">{news.source}</span>
                <span className="text-muted-foreground/50 text-xs">Â·</span>
                <span className="text-muted-foreground text-xs font-roboto">{news.time}</span>
                <span className="text-muted-foreground/50 text-xs">Â·</span>
                <span className="flex items-center gap-0.5 text-muted-foreground text-xs font-roboto">
                  <Icon name="Eye" size={10} /> {news.views}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
