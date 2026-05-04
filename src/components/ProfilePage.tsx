import Icon from "@/components/ui/icon";
import { useAuth } from "@/context/AuthContext";

const ACHIEVEMENTS = [
  { icon: "ð", label: "Ð­ÐºÑÐ¿ÐµÑÑ MotoGP", desc: "1000+ ÑÐµÐ°ÐºÑÐ¸Ð¹" },
  { icon: "ð¥", label: "ÐÐ¾ÑÑÑÐ°Ñ ÑÐµÐ¼Ð°", desc: "5 Ð¿Ð¾ÑÑÐ¾Ð² Ð² ÑÑÐµÐ½Ð´Ðµ" },
  { icon: "â¡", label: "ÐÐµÑÐ²ÑÐ¹ Ð² ÑÐ°ÑÐµ", desc: "50+ ÑÐµÐ¿Ð¾ÑÑÐ°Ð¶ÐµÐ¹" },
  { icon: "ð¯", label: "Ð¢Ð¾ÑÐ½ÑÐ¹ Ð¿ÑÐ¾Ð³Ð½Ð¾Ð·", desc: "10 Ð²ÐµÑÐ½ÑÑ ÑÑÐ°Ð²Ð¾Ðº" },
];

const POSTS_PREVIEW = [
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80",
  "https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=400&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80",
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const U = user || {
    display_name: "ÐÐ¾ÑÑÑ",
    username: "guest",
    bio: "",
    avatar_emoji: "ð",
    posts_count: 0,
    followers_count: 0,
    following_count: 0,
    is_verified: false,
    favorite_sports: [] as string[],
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-oswald text-2xl font-bold tracking-widest text-white">ÐÐ ÐÐ¤ÐÐÐ¬</h1>
        <div className="flex gap-3">
          <button className="text-muted-foreground hover:text-white transition-colors">
            <Icon name="Settings" size={22} />
          </button>
          <button onClick={logout} className="text-muted-foreground hover:text-red-400 transition-colors">
            <Icon name="LogOut" size={20} />
          </button>
        </div>
      </div>

      {/* Profile hero */}
      <div className="px-4 py-4 animate-fade-in opacity-0">
        {/* Background strip */}
        <div className="h-24 rounded-t-xl fire-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
          <div className="absolute top-3 right-3">
            <Icon name="Camera" size={20} className="text-white/70" />
          </div>
        </div>

        {/* Avatar + info */}
        <div className="bg-card border border-t-0 border-border rounded-b-xl px-4 pb-4">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="w-16 h-16 rounded-full bg-secondary border-4 border-card flex items-center justify-center text-3xl">
              {U.avatar_emoji}
            </div>
            <button className="fire-gradient text-white px-4 py-2 rounded-lg font-oswald font-semibold text-sm tracking-wide">
              Ð ÐÐÐÐÐ¢ÐÐ ÐÐÐÐ¢Ð¬
            </button>
          </div>

          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="font-oswald text-white text-xl font-bold">{U.display_name}</h2>
            {U.is_verified && <Icon name="BadgeCheck" size={18} className="text-fire" />}
          </div>
          <p className="text-muted-foreground text-xs font-roboto mb-2">@{U.username}</p>
          {U.bio && <p className="text-white/80 text-sm font-roboto mb-3">{U.bio}</p>}

          {/* Favorites */}
          {U.favorite_sports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {U.favorite_sports.map(f => (
                <span key={f} className="bg-fire/10 border border-fire/30 text-fire text-xs font-oswald font-bold px-2 py-1 rounded-full tracking-wide">{f}</span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-0 divide-x divide-border">
            {[
              { label: "ÐÑÐ±Ð»Ð¸ÐºÐ°ÑÐ¸Ð¸", value: U.posts_count },
              { label: "ÐÐ¾Ð´Ð¿Ð¸ÑÑÐ¸ÐºÐ¸", value: U.followers_count.toLocaleString() },
              { label: "ÐÐ¾Ð´Ð¿Ð¸ÑÐºÐ¸", value: U.following_count },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center py-2">
                <span className="font-oswald font-bold text-white text-xl">{s.value}</span>
                <span className="text-muted-foreground text-xs font-roboto">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-4 mb-4 animate-fade-in stagger-1 opacity-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-oswald font-bold text-fire tracking-wider text-sm">ÐÐÐ¡Ð¢ÐÐÐÐÐÐ¯</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map((ach, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">{ach.icon}</span>
              <div>
                <p className="font-oswald text-white text-sm font-bold">{ach.label}</p>
                <p className="text-muted-foreground text-xs font-roboto">{ach.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="px-4 animate-fade-in stagger-2 opacity-0">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-oswald font-bold text-fire tracking-wider text-sm">ÐÐÐ ÐÐ£ÐÐÐÐÐÐ¦ÐÐ</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {POSTS_PREVIEW.map((img, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer hover:opacity-80 transition-opacity">
              <img src={img} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Settings section */}
      <div className="px-4 mt-4 animate-fade-in stagger-3 opacity-0">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {[
            { icon: "Bell", label: "Ð£Ð²ÐµÐ´Ð¾Ð¼Ð»ÐµÐ½Ð¸Ñ", sub: "ÐÐ°ÑÑÑÐ¾Ð¹ÐºÐ° Ð¾Ð¿Ð¾Ð²ÐµÑÐµÐ½Ð¸Ð¹" },
            { icon: "Shield", label: "ÐÑÐ¸Ð²Ð°ÑÐ½Ð¾ÑÑÑ", sub: "ÐÐ¾ÑÑÑÐ¿Ð½Ð¾ÑÑÑ Ð¿ÑÐ¾ÑÐ¸Ð»Ñ" },
            { icon: "Globe", label: "Ð¯Ð·ÑÐº Ð¸ ÑÐµÐ³Ð¸Ð¾Ð½", sub: "Ð ÑÑÑÐºÐ¸Ð¹ Â· Ð Ð¾ÑÑÐ¸Ñ" },
            { icon: "HelpCircle", label: "ÐÐ¾Ð´Ð´ÐµÑÐ¶ÐºÐ°", sub: "ÐÐ¾Ð¼Ð¾ÑÑ Ð¸ FAQ" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0 text-left">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Icon name={item.icon} size={16} className="text-fire" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-roboto font-medium">{item.label}</p>
                <p className="text-muted-foreground text-xs font-roboto">{item.sub}</p>
              </div>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}