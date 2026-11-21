import { useMemo, useState } from "react";
import {
  Bell, Check, ChevronRight, Flame, Heart, Home as HomeIcon, ImagePlus, LogOut,
  MessageCircle, MoreHorizontal, Palette, Play, Plus, Search, Send, Settings,
  Share2, Sparkles, Upload, UserRound, X, Zap
} from "lucide-react";

const videos = [
  { id: 1, user: "Mila Chen", handle: "@milachen", caption: "late light, soft focus, no plans ✦", tags: "#slowdays  #goldenhour", likes: "8.4K", comments: "214", accent: "sunset", poster: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-12339-large.mp4" },
  { id: 2, user: "Noah Park", handle: "@noahpark", caption: "Found a little bit of magic on my walk home.", tags: "#cityglow  #afterhours", likes: "12.1K", comments: "389", accent: "blue", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-11-large.mp4" },
  { id: 3, user: "Lena Ortiz", handle: "@lena.o", caption: "A tiny reset between two very big days.", tags: "#rituals  #morningclub", likes: "5.8K", comments: "97", accent: "mint", poster: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-a-studio-39803-large.mp4" },
];

const conversations = [
  { name: "Mila Chen", handle: "@milachen", avatar: "MC", color: "#ff8a70", preview: "that color on you!!", time: "2m", unread: 2, streak: 12, streakColor: "ember" },
  { name: "Noah Park", handle: "@noahpark", avatar: "NP", color: "#9d8cff", preview: "sent you a glow", time: "1h", unread: 0, streak: 5, streakColor: "lavender" },
  { name: "Lena Ortiz", handle: "@lena.o", avatar: "LO", color: "#81d6b4", preview: "see you at 7 ✦", time: "3h", unread: 0, streak: 21, streakColor: "mint" },
];

const navItems = [
  { id: "feed", label: "Лента", icon: HomeIcon },
  { id: "discover", label: "Обзор", icon: Search },
  { id: "chats", label: "Чаты", icon: MessageCircle },
  { id: "profile", label: "Профиль", icon: UserRound },
];

type View = "feed" | "discover" | "chats" | "profile";

export default function Home() {
  const [view, setView] = useState<View>("feed");
  const [activeVideo, setActiveVideo] = useState(0);
  const [liked, setLiked] = useState<number[]>([2]);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [fireStyle, setFireStyle] = useState(() => localStorage.getItem("glowix-fire") || "ember");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState(0);
  const [profileName, setProfileName] = useState(() => localStorage.getItem("glowix-name") || "Sasha Volkova");
  const [bio, setBio] = useState(() => localStorage.getItem("glowix-bio") || "collecting little moments ✦");
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("glowix-auth") === "1");
  const [uploaded, setUploaded] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

  const current = videos[activeVideo];
  const isLiked = liked.includes(current.id);
  const streakLabel = fireStyle === "lavender" ? "7 days" : fireStyle === "mint" ? "7 days" : "7 days";
  const sortedChats = useMemo(() => conversations, []);
  const activeChat = sortedChats[selectedChat];

  const toggleLike = (id: number) => setLiked(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleSend = () => { if (!message.trim()) return; setSentMessages(prev => [...prev, message.trim()]); setMessage(""); };

  return (
    <div className="glowix-app">
      <aside className="side-rail">
        <div className="brand-mark" onClick={() => setView("feed")}><span className="brand-spark">✦</span><span>glowix</span></div>
        <div className="rail-label">YOUR SPACE</div>
        <nav className="rail-nav">
          {navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id as View)}><Icon size={19} strokeWidth={1.8}/><span>{item.label}</span>{item.id === "chats" && <b className="nav-dot">2</b>}</button>; })}
        </nav>
        <button className="upload-rail" onClick={() => setShowUpload(true)}><span><Plus size={18}/></span><div><strong>Поделиться</strong><small>новый момент</small></div></button>
        <div className="rail-bottom"><button className="nav-item" onClick={() => setShowCustomize(true)}><Settings size={19}/><span>Настройки</span></button><div className="mini-user" onClick={() => setView("profile")}><div className="avatar gradient-avatar">SV</div><div><strong>{profileName}</strong><small>@sashav</small></div><MoreHorizontal size={18}/></div></div>
      </aside>

      <main className="main-column">
        <header className="topbar"><div className="mobile-brand"><span className="brand-spark">✦</span>glowix</div><div className="topbar-title">{view === "feed" ? "Для тебя" : view === "discover" ? "Обзор" : view === "chats" ? "Чаты" : "Профиль"}<span className="live-dot"/></div><div className="topbar-actions"><button className="icon-button"><Bell size={19}/><i/></button><div className="mobile-streak" onClick={() => setShowCustomize(true)}><Flame size={16} fill="currentColor"/> {streakLabel}</div></div></header>

        {view === "feed" && <section className="feed-view"><div className="feed-intro"><div><p className="eyebrow">SATURDAY, 21 NOVEMBER</p><h1>Твоя лента<br/><em>горит мягко.</em></h1></div><button className="filter-pill"><Sparkles size={15}/> Для тебя <ChevronRight size={14}/></button></div><div className="video-card" data-accent={current.accent}><video key={current.id} className="feed-video" poster={current.poster} src={current.src} autoPlay muted loop playsInline/><div className="video-shade"/><div className="video-top"><div className="creator"><div className="avatar creator-avatar">{current.user.split(" ").map(x => x[0]).join("")}</div><div><strong>{current.user}</strong><span>{current.handle}</span></div><button className="follow-button">Подписаться</button></div><button className="more-button"><MoreHorizontal size={20}/></button></div><div className="video-info"><p>{current.caption}</p><span>{current.tags}</span></div><div className="video-actions"><button onClick={() => toggleLike(current.id)} className={isLiked ? "liked" : ""}><Heart size={22} fill={isLiked ? "currentColor" : "none"}/><small>{current.likes}</small></button><button><MessageCircle size={22}/><small>{current.comments}</small></button><button><Share2 size={21}/><small>share</small></button><button className="sound-pill"><span className="sound-bars"><i/><i/><i/></span> original</button></div><div className="video-progress"><span style={{ width: `${[54, 71, 38][activeVideo]}%` }}/></div></div><div className="feed-switcher"><button onClick={() => setActiveVideo((activeVideo + videos.length - 1) % videos.length)}><ChevronRight size={18} className="rotate-180"/></button><span>{String(activeVideo + 1).padStart(2,"0")} <i/> 03</span><button onClick={() => setActiveVideo((activeVideo + 1) % videos.length)}><ChevronRight size={18}/></button></div></section>}

        {view === "discover" && <section className="discover-view"><div className="section-heading"><div><p className="eyebrow">FIND YOUR GLOW</p><h1>Обзор</h1></div><button className="icon-button"><Search size={19}/></button></div><div className="topic-row"><span className="topic active">Все</span><span className="topic">#cityglow</span><span className="topic">#slowdays</span><span className="topic">#outfitcheck</span></div><div className="discover-grid">{[...videos, ...videos].map((video, i) => <button className="discover-tile" key={`${video.id}-${i}`} onClick={() => { setActiveVideo(i % 3); setView("feed"); }}><img src={video.poster} alt=""/><span className="tile-gradient"/><span className="tile-meta"><Play size={13} fill="white"/> {video.likes}</span></button>)}</div></section>}

        {view === "profile" && <section className="profile-view"><div className="profile-hero"><div className="profile-avatar-wrap"><div className="profile-avatar">SV</div><button className="avatar-plus" onClick={() => setShowCustomize(true)}><Plus size={13}/></button></div><div className="profile-copy"><p className="eyebrow">YOUR GLOW</p><h1>{profileName}</h1><span className="handle">@sashavolkova</span><p className="profile-bio">{bio}</p><button className="outline-button" onClick={() => setShowCustomize(true)}><Palette size={15}/> Изменить профиль</button></div><button className="more-button"><MoreHorizontal size={21}/></button></div><div className="profile-stats"><div><b>24</b><span>публикации</span></div><div><b>1.8K</b><span>подписчики</span></div><div><b>462</b><span>подписки</span></div><div className={`streak-stat ${fireStyle}`}><Flame size={20} fill="currentColor"/><b>7</b><span>дней подряд</span></div></div><div className="profile-tabs"><button className="active">Видео</button><button>Сохранённое</button></div><div className="profile-grid">{[...videos, ...videos].map((video, i) => <div className="profile-tile" key={i}><img src={video.poster} alt=""/><span><Play size={13} fill="white"/> {i + 2}.4K</span></div>)}</div>{uploaded && <div className="upload-toast"><Check size={15}/> Видео добавлено в профиль</div>}</section>}

        {view === "chats" && <section className="chats-view"><div className="chats-layout"><div className="chat-list"><div className="chat-list-head"><div><p className="eyebrow">KEEP IT CLOSE</p><h1>Чаты</h1></div><button className="icon-button"><Plus size={19}/></button></div><div className="search-field"><Search size={16}/><input placeholder="Найти человека"/></div>{sortedChats.map((chat, i) => <button className={`chat-preview ${i === selectedChat ? "selected" : ""}`} key={chat.name} onClick={() => { setSelectedChat(i); setSentMessages([]); }}><div className="avatar" style={{background: chat.color}}>{chat.avatar}</div><div className="chat-preview-copy"><strong>{chat.name}</strong><span>{chat.preview}</span></div><div className="chat-preview-meta"><small>{chat.time}</small><span className={`chat-streak ${chat.streakColor}`}><Flame size={12} fill="currentColor"/> {chat.streak}</span>{chat.unread > 0 && <b>{chat.unread}</b>}</div></button>)}</div><div className="conversation"><div className="conversation-head"><div className="avatar" style={{background: activeChat.color}}>{activeChat.avatar}</div><div><strong>{activeChat.name}</strong><span>active now</span></div><div className={`conversation-streak ${activeChat.streakColor}`}><Flame size={14} fill="currentColor"/><b>{activeChat.streak}</b><small>дней</small></div><MoreHorizontal size={20}/></div><div className="message-space"><div className="day-divider">TODAY</div><div className="bubble received">that sunset video is so good. <br/>the colors are everything ✦<span>18:42</span></div><div className="bubble sent">you get it!! i almost didn’t post it<span>18:43 <Check size={12}/></span></div><div className="bubble received">never hide the good stuff 🌞<span>18:43</span></div>{sentMessages.map((msg, i) => <div className="bubble sent" key={i}>{msg}<span>now <Check size={12}/></span></div>)}</div><div className="message-compose"><button><Plus size={19}/></button><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Написать сообщение..."/><button className="send-button" onClick={handleSend}><Send size={17}/></button></div></div></div></section>}
      </main>

      <nav className="mobile-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id as View)}><Icon size={20}/><span>{item.label}</span>{item.id === "chats" && <i/>}</button>; })}<button className="mobile-upload" onClick={() => setShowUpload(true)}><Plus size={22}/></button></nav>

      {!loggedIn && <div className="login-banner"><div><span className="eyebrow">MAKE IT YOURS</span><strong>Зажги свой Glowix</strong></div><button onClick={() => setShowAuth(true)}>Войти / создать</button></div>}

      {showAuth && <div className="modal-backdrop" onClick={() => setShowAuth(false)}><div className="modal auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAuth(false)}><X size={18}/></button><div className="modal-symbol"><Sparkles size={20}/></div><p className="eyebrow">WELCOME TO GLOWIX</p><h2>Твоё место,<br/><em>твой свет.</em></h2><p className="modal-subtitle">Создай аккаунт и сохраняй свои маленькие моменты в одном тёплом пространстве.</p><label>Email<input type="email" placeholder="you@example.com"/></label><label>Пароль<input type="password" placeholder="••••••••"/></label><button className="primary-button" onClick={() => { localStorage.setItem("glowix-auth", "1"); setLoggedIn(true); setShowAuth(false); }}>Продолжить <ChevronRight size={17}/></button><span className="terms">Продолжая, ты принимаешь правила Glowix</span></div></div>}

      {showUpload && <div className="modal-backdrop" onClick={() => setShowUpload(false)}><div className="modal upload-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowUpload(false)}><X size={18}/></button><div className="upload-drop"><div className="upload-icon"><Upload size={22}/></div><h2>Новый момент</h2><p>Загрузи вертикальное видео<br/>до 60 секунд</p><input id="glowix-upload" type="file" accept="video/mp4,video/quicktime,video/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; setUploadedVideo(URL.createObjectURL(file)); setUploaded(true); setShowUpload(false); setView("profile"); }}/><label className="primary-button" htmlFor="glowix-upload">Выбрать видео <ImagePlus size={17}/></label><small>MP4, MOV · до 100 MB</small></div></div></div>}

      {showCustomize && <div className="modal-backdrop" onClick={() => setShowCustomize(false)}><div className="modal customize-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowCustomize(false)}><X size={18}/></button><p className="eyebrow">MAKE IT YOURS</p><h2>Настроить glow</h2><div className="custom-preview"><div className={`big-fire ${fireStyle}`}><Flame size={38} fill="currentColor"/></div><div><strong>Твоя серия</strong><span>7 дней подряд</span></div><Zap size={18}/></div><p className="field-label">Стиль огонька</p><div className="style-options"><button className={fireStyle === "ember" ? "selected" : ""} onClick={() => setFireStyle("ember")}><Flame size={20}/><span>Ember</span></button><button className={fireStyle === "lavender" ? "selected" : ""} onClick={() => setFireStyle("lavender")}><Flame size={20}/><span>Violet</span></button><button className={fireStyle === "mint" ? "selected" : ""} onClick={() => setFireStyle("mint")}><Flame size={20}/><span>Mint</span></button></div><div className="custom-form"><label>Имя<input value={profileName} onChange={e => setProfileName(e.target.value)}/></label><label>О себе<textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}/></label></div><button className="primary-button" onClick={() => { localStorage.setItem("glowix-fire", fireStyle); localStorage.setItem("glowix-name", profileName); localStorage.setItem("glowix-bio", bio); setShowCustomize(false); }}>Сохранить изменения <Check size={17}/></button></div></div>}
    </div>
  );
}
