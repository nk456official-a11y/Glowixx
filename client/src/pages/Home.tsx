import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CornerDownRight,
  Flame,
  Heart,
  Home as HomeIcon,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Palette,
  Play,
  Plus,
  Repeat2,
  Search,
  Send,
  Settings,
  Share2,
  Sparkles,
  Upload,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type FeedPost = {
  id: number;
  externalId: string;
  user: string;
  handle: string;
  caption: string;
  tags: string;
  likes: number;
  comments: number;
  reposts: number;
  accent: string;
  poster: string | null;
  src: string;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  createdAt: Date;
};

const fallbackVideos: FeedPost[] = [
  { id: 1, externalId: "seed-mila-chen", user: "Mila Chen", handle: "@milachen", caption: "late light, soft focus, no plans ✦", tags: "#slowdays  #goldenhour", likes: 0, comments: 0, reposts: 0, accent: "sunset", poster: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-woman-dancing-under-neon-lights-12339-large.mp4", isLiked: false, isReposted: false, isSaved: false, createdAt: new Date() },
  { id: 2, externalId: "seed-noah-park", user: "Noah Park", handle: "@noahpark", caption: "Found a little bit of magic on my walk home.", tags: "#cityglow  #afterhours", likes: 0, comments: 0, reposts: 0, accent: "blue", poster: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-night-11-large.mp4", isLiked: false, isReposted: false, isSaved: false, createdAt: new Date() },
  { id: 3, externalId: "seed-lena-ortiz", user: "Lena Ortiz", handle: "@lena.o", caption: "A tiny reset between two very big days.", tags: "#rituals  #morningclub", likes: 0, comments: 0, reposts: 0, accent: "mint", poster: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=900&q=85", src: "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-yoga-in-a-studio-39803-large.mp4", isLiked: false, isReposted: false, isSaved: false, createdAt: new Date() },
];

const conversations = [
  { name: "Mila Chen", handle: "@milachen", avatar: "MC", color: "#ff8a70", preview: "that color on you!!", time: "2m", unread: 2, streak: 12, streakColor: "ember" },
  { name: "Noah Park", handle: "@noahpark", avatar: "NP", color: "#9d8cff", preview: "sent you a glow", time: "1h", unread: 0, streak: 5, streakColor: "lavender" },
  { name: "Lena Ortiz", handle: "@lena.o", avatar: "LO", color: "#81d6b4", preview: "see you at 7 ✦", time: "3h", unread: 0, streak: 21, streakColor: "mint" },
];

const avatarOptions = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
];

const navItems = [
  { id: "feed", label: "Лента", icon: HomeIcon },
  { id: "friends", label: "Друзья", icon: UsersRound },
  { id: "chats", label: "Чаты", icon: MessageCircle },
  { id: "profile", label: "Профиль", icon: UserRound },
];

type View = "feed" | "friends" | "discover" | "chats" | "profile";

type ProfileTab = "videos" | "saved" | "reposts";

function getClientId() {
  const storageKey = "glowix-client-id";
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) return stored;
    const created = `client-${crypto.randomUUID()}`;
    localStorage.setItem(storageKey, created);
    return created;
  } catch {
    return `client-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }
}

export default function Home() {
  const [view, setView] = useState<View>("feed");
  const [clientId] = useState(() => getClientId());
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [fireStyle, setFireStyle] = useState(() => localStorage.getItem("glowix-fire") || "ember");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [selectedChat, setSelectedChat] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileName, setProfileName] = useState(() => localStorage.getItem("glowix-name") || "Sasha Volkova");
  const [bio, setBio] = useState(() => localStorage.getItem("glowix-bio") || "collecting little moments ✦");
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("glowix-avatar") || "");
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem("glowix-auth") === "1");
  const [following, setFollowing] = useState<string[]>([]);
  const [mutedPosts, setMutedPosts] = useState<Record<number, boolean>>({});
  const [profileTab, setProfileTab] = useState<ProfileTab>("videos");
  const [uploading, setUploading] = useState(false);

  const postsQuery = trpc.posts.list.useQuery({ clientId });
  const feedPosts = (postsQuery.data as FeedPost[] | undefined) ?? fallbackVideos;
  const savedPostsQuery = trpc.posts.saved.useQuery({ clientId }, { enabled: view === "profile" && profileTab === "saved" });
  const selectedPost = feedPosts.find(post => post.id === selectedPostId);
  const commentsQuery = trpc.posts.comments.useQuery(
    { postId: selectedPostId ?? 0, clientId },
    { enabled: selectedPostId !== null },
  );
  const utils = trpc.useUtils();
  const likeMutation = trpc.posts.toggleLike.useMutation({
    onSuccess: () => utils.posts.list.invalidate(),
    onError: () => toast.error("Не удалось сохранить лайк"),
  });
  const repostMutation = trpc.posts.toggleRepost.useMutation({
    onSuccess: async ({ reposted }) => {
      await utils.posts.list.invalidate();
      toast.success(reposted ? "Видео добавлено в репосты" : "Репост отменён");
    },
    onError: () => toast.error("Не удалось сохранить репост"),
  });
  const saveMutation = trpc.posts.toggleSave.useMutation({
    onSuccess: async ({ saved }) => {
      await Promise.all([utils.posts.list.invalidate(), utils.posts.saved.invalidate()]);
      toast.success(saved ? "Видео сохранено" : "Видео убрано из сохранённых");
    },
    onError: () => toast.error("Не удалось изменить сохранение"),
  });
  const addCommentMutation = trpc.posts.addComment.useMutation({
    onSuccess: async () => {
      setCommentText("");
      setReplyingTo(null);
      await Promise.all([commentsQuery.refetch(), utils.posts.list.invalidate()]);
      toast.success("Комментарий добавлен");
    },
    onError: () => toast.error("Не удалось отправить комментарий"),
  });
  const commentLikeMutation = trpc.posts.toggleCommentLike.useMutation({
    onSuccess: () => commentsQuery.refetch(),
    onError: () => toast.error("Не удалось сохранить лайк комментария"),
  });

  const sortedChats = useMemo(() => conversations, []);
  const activeChat = sortedChats[selectedChat];
  const repostedProfilePosts = feedPosts.filter(post => post.isReposted);
  const visibleFeedPosts = view === "friends" ? feedPosts.filter(post => following.includes(post.handle)) : feedPosts;

  const setActiveView = (nextView: View) => setView(nextView);

  const notify = (text: string) => toast(text);

  const scrollToPost = (postId: number) => {
    setView("feed");
    window.requestAnimationFrame(() => document.getElementById(`post-${postId}`)?.scrollIntoView({ behavior: "smooth" }));
  };

  const toggleLike = (postId: number) => {
    likeMutation.mutate({ postId, clientId });
  };

  const openComments = (postId: number) => {
    setSelectedPostId(postId);
    setCommentText("");
    setReplyingTo(null);
    setShowComments(true);
  };

  const submitComment = () => {
    if (!selectedPostId || !commentText.trim()) return;
    addCommentMutation.mutate({
      postId: selectedPostId,
      parentId: replyingTo,
      clientId,
      authorName: profileName.trim() || "Sasha Volkova",
      body: commentText.trim(),
    });
  };

  const startReply = (commentId: number, authorName: string) => {
    setReplyingTo(commentId);
    setCommentText(`@${authorName} `);
  };

  const shareVideo = async (post: FeedPost) => {
    if (!navigator.share) {
      toast.error("Этот браузер не поддерживает отправку видео");
      return;
    }

    try {
      const response = await fetch(post.src);
      if (!response.ok) throw new Error("Видео недоступно");
      const blob = await response.blob();
      const file = new File([blob], `glowix-video-${post.id}.mp4`, { type: blob.type || "video/mp4" });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        throw new Error("Этот браузер не поддерживает отправку видеофайла");
      }
      await navigator.share({ files: [file], title: post.caption, text: `Видео от ${post.user} в Glowix` });
      toast.success("Видео готово к отправке");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error(error instanceof Error ? error.message : "Не удалось подготовить видео");
    }
  };

  const uploadVideo = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Выберите видеофайл");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Видео должно быть не больше 100 MB");
      return;
    }

    setUploading(true);
    try {
      const response = await fetch("/api/uploads/video", {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "X-Glowix-Filename": encodeURIComponent(file.name),
          "X-Glowix-Client-Id": clientId,
        },
        body: file,
        credentials: "include",
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Upload failed");
      await utils.posts.list.invalidate();
      setShowUpload(false);
      setView("profile");
      toast.success("Видео загружено в Glowix");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось загрузить видео");
    } finally {
      setUploading(false);
    }
  };

  const currentFollowing = (handle: string) => following.includes(handle);

  return (
    <div className="glowix-app">
      <aside className="side-rail">
        <div className="brand-mark" onClick={() => setActiveView("feed")}><span className="brand-spark">✦</span><span>glowix</span></div>
        <div className="rail-label">YOUR SPACE</div>
        <nav className="rail-nav" aria-label="Основная навигация">
          {navItems.map(item => { const Icon = item.icon; return <button type="button" key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setActiveView(item.id as View)}><Icon size={19} strokeWidth={1.8}/><span>{item.label}</span>{item.id === "chats" && <b className="nav-dot">2</b>}</button>; })}
        </nav>
        <button type="button" className="upload-rail" onClick={() => setShowUpload(true)}><span><Plus size={18}/></span><div><strong>Поделиться</strong><small>новый момент</small></div></button>
        <div className="rail-bottom"><button type="button" className="nav-item" onClick={() => setShowCustomize(true)}><Settings size={19}/><span>Настройки</span></button><div className="mini-user" onClick={() => setActiveView("profile")}><div className="avatar gradient-avatar" style={avatarUrl ? {backgroundImage: `url(${avatarUrl})`} : undefined}>{!avatarUrl && "SV"}</div><div><strong>{profileName}</strong><small>@sashav</small></div><MoreHorizontal size={18}/></div></div>
      </aside>

      <main className="main-column">
        <header className={`topbar ${view === "feed" ? "feed-topbar" : ""}`}><div className="mobile-brand"><span className="brand-spark">✦</span>glowix</div><div className="topbar-title">{view === "feed" ? "Для тебя" : view === "friends" ? "Друзья" : view === "discover" ? "Обзор" : view === "chats" ? "Чаты" : "Профиль"}<span className="live-dot"/></div><div className="topbar-actions"><button type="button" className="icon-button" aria-label="Уведомления" onClick={() => notify("Уведомления будут здесь") }><Bell size={19}/><i/></button></div></header>

        {(view === "feed" || view === "friends") && <section className="feed-view" aria-label="Лента Glowix"><button type="button" className="feed-search-button" onClick={() => setView("discover")} aria-label="Открыть поиск"><Search size={19}/></button><div className="feed-stream">
          {visibleFeedPosts.length ? visibleFeedPosts.map((post, index) => {
            const isMuted = mutedPosts[post.id] ?? true;
            const isFollowing = currentFollowing(post.handle);
            return <article className="feed-item" id={`post-${post.id}`} key={post.id}>
              <div className="video-card" data-accent={post.accent}>
                <video className="feed-video" poster={post.poster ?? undefined} src={post.src} autoPlay muted={isMuted} loop playsInline onClick={event => { const video = event.currentTarget; if (video.paused) void video.play(); else video.pause(); }} aria-label={`Видео от ${post.user}`}/>
                <div className="video-shade"/>
                <div className="video-top"><div className="creator"><div className="avatar creator-avatar">{post.user.split(" ").map(x => x[0]).join("")}</div><div><strong>{post.user}</strong><span>{post.handle}</span></div><button type="button" className={`follow-button ${isFollowing ? "following" : ""}`} onClick={() => setFollowing(current => isFollowing ? current.filter(handle => handle !== post.handle) : [...current, post.handle])}>{isFollowing ? "Подписка" : "Подписаться"}</button></div><button type="button" className="more-button" aria-label="Ещё" onClick={() => notify("Дополнительные действия появятся здесь")}><MoreHorizontal size={20}/></button></div>
                <div className="video-info"><p>{post.caption}</p><span>{post.tags}</span></div>
                <div className="video-actions"><button type="button" onClick={() => toggleLike(post.id)} className={post.isLiked ? "liked" : ""} aria-label="Поставить лайк"><Heart size={22} fill={post.isLiked ? "currentColor" : "none"}/><small>{post.likes}</small></button><button type="button" className="comment-button" onClick={() => openComments(post.id)} aria-label="Открыть комментарии"><MessageCircle size={22} fill="white"/><small>{post.comments}</small></button><button type="button" onClick={() => void shareVideo(post)} aria-label="Отправить видео"><Share2 size={21}/><small>send video</small></button><button type="button" onClick={() => saveMutation.mutate({ postId: post.id, clientId })} className={`save-video-button ${post.isSaved ? "saved" : ""}`} aria-label={post.isSaved ? "Убрать из сохранённых" : "Сохранить видео"}><Bookmark size={20} fill={post.isSaved ? "currentColor" : "none"}/><small>{post.isSaved ? "saved" : "save"}</small></button><button type="button" className="sound-pill" onClick={() => setMutedPosts(current => ({ ...current, [post.id]: !isMuted }))}><span className="sound-bars"><i/><i/><i/></span>{isMuted ? "sound off" : "sound on"}</button></div>
                <div className="video-progress"><span style={{ width: `${[54, 71, 38][index % 3]}%` }}/></div>
              </div><div className="post-action-bar"><button type="button" className={`post-action-button repost-button ${post.isReposted ? "reposted" : ""}`} onClick={() => repostMutation.mutate({ postId: post.id, clientId })} aria-label="Репостить видео"><Repeat2 size={18}/><span>{post.isReposted ? "Репост опубликован" : "Репостить видео"}</span><b>{post.reposts}</b></button></div>
            </article>;
          }) : <div className="empty-state friends-empty"><UsersRound size={22}/><strong>Лента друзей пока пуста</strong><span>Подпишись на авторов в общей ленте — их видео появятся здесь.</span></div>}
        </div></section>}

        {view === "discover" && <section className="discover-view"><div className="section-heading"><div><p className="eyebrow">FIND YOUR GLOW</p><h1>Обзор</h1></div><button type="button" className="icon-button" onClick={() => notify("Поиск по Glowix скоро будет доступен")} aria-label="Поиск"><Search size={19}/></button></div><div className="topic-row"><button type="button" className="topic active" onClick={() => notify("Показываем все моменты")}>Все</button><button type="button" className="topic" onClick={() => notify("Фильтр #cityglow")}>#cityglow</button><button type="button" className="topic" onClick={() => notify("Фильтр #slowdays")}>#slowdays</button><button type="button" className="topic" onClick={() => notify("Фильтр #outfitcheck")}>#outfitcheck</button></div><div className="discover-grid">{[...feedPosts, ...feedPosts].map((post, i) => <button type="button" className="discover-tile" key={`${post.id}-${i}`} onClick={() => scrollToPost(post.id)}><img src={post.poster ?? undefined} alt=""/><span className="tile-gradient"/><span className="tile-meta"><Play size={13} fill="white"/> {post.likes}</span></button>)}</div></section>}

        {view === "profile" && <section className="profile-view"><div className="profile-hero"><div className="profile-avatar-wrap"><div className="profile-avatar" style={avatarUrl ? {backgroundImage: `url(${avatarUrl})`} : undefined}>{!avatarUrl && "SV"}</div><button type="button" className="avatar-plus" onClick={() => setShowCustomize(true)} aria-label="Изменить аватар"><Plus size={13}/></button></div><div className="profile-copy"><p className="eyebrow">YOUR GLOW</p><h1>{profileName}</h1><span className="handle">@sashavolkova</span><p className="profile-bio">{bio}</p><button type="button" className="outline-button" onClick={() => setShowCustomize(true)}><Palette size={15}/> Изменить профиль</button></div><button type="button" className="more-button" onClick={() => notify("Настройки профиля открываются через меню")} aria-label="Меню профиля"><MoreHorizontal size={21}/></button></div><div className="profile-stats profile-stats-three"><div><b>{feedPosts.length}</b><span>публикации</span></div><div><b>{savedPostsQuery.data?.length ?? 0}</b><span>сохранено</span></div><div><b>462</b><span>подписки</span></div></div><div className="profile-tabs"><button type="button" className={profileTab === "videos" ? "active" : ""} onClick={() => setProfileTab("videos")}>Видео</button><button type="button" className={profileTab === "saved" ? "active" : ""} onClick={() => setProfileTab("saved")}>Сохранённое</button><button type="button" className={profileTab === "reposts" ? "active" : ""} onClick={() => setProfileTab("reposts")}>Репосты</button></div>{profileTab === "videos" ? <div className="profile-grid">{feedPosts.map(post => <button type="button" className="profile-tile" key={post.id} onClick={() => scrollToPost(post.id)}>{post.poster ? <img src={post.poster} alt=""/> : <video src={post.src} muted playsInline/>}<span><Play size={13} fill="white"/> {post.likes}</span></button>)}</div> : profileTab === "saved" ? savedPostsQuery.isLoading ? <div className="empty-state"><LoaderCircle className="spin" size={20}/><span>Загружаем сохранённые рилы...</span></div> : savedPostsQuery.data?.length ? <div className="profile-grid">{savedPostsQuery.data.map(post => <button type="button" className="profile-tile" key={post.id} onClick={() => scrollToPost(post.id)}>{post.poster ? <img src={post.poster} alt=""/> : <video src={post.src} muted playsInline/>}<span><Bookmark size={13} fill="currentColor"/> Сохранено</span></button>)}</div> : <div className="empty-state"><Bookmark size={20}/><strong>Сохраняй то, что зажигает</strong><span>Нажми на закладку у видео — оно появится здесь.</span></div> : repostedProfilePosts.length ? <div className="profile-grid">{repostedProfilePosts.map(post => <button type="button" className="profile-tile" key={post.id} onClick={() => scrollToPost(post.id)}>{post.poster ? <img src={post.poster} alt=""/> : <video src={post.src} muted playsInline/>}<span><Repeat2 size={13}/> Репост</span></button>)}</div> : <div className="empty-state"><Repeat2 size={20}/><strong>Твои репосты появятся здесь</strong><span>Нажми «Репостить видео» под понравившимся рилом.</span></div>}</section>}

        {view === "chats" && <section className="chats-view"><div className={`chats-layout ${chatOpen ? "chat-fullscreen" : ""}`}><div className="chat-list"><div className="chat-list-head"><div><p className="eyebrow">KEEP IT CLOSE</p><h1>Чаты</h1></div><button type="button" className="icon-button" onClick={() => notify("Новый чат скоро будет доступен")} aria-label="Новый чат"><Plus size={19}/></button></div><div className="search-field"><Search size={16}/><input placeholder="Найти человека" aria-label="Найти человека"/></div>{sortedChats.map((chat, i) => <button type="button" className={`chat-preview ${i === selectedChat ? "selected" : ""}`} key={chat.name} onClick={() => { setSelectedChat(i); setSentMessages([]); setChatOpen(true); }}><div className="avatar" style={{background: chat.color}}>{chat.avatar}</div><div className="chat-preview-copy"><strong>{chat.name}</strong><span>{chat.preview}</span></div><div className="chat-preview-meta"><small>{chat.time}</small><span className={`chat-streak ${chat.streakColor}`}><Flame size={12} fill="currentColor"/> {chat.streak}</span>{chat.unread > 0 && <b>{chat.unread}</b>}</div></button>)}</div><div className="conversation"><div className="conversation-head"><button type="button" className="chat-back" onClick={() => setChatOpen(false)} aria-label="Назад"><ArrowLeft size={18}/></button><div className="avatar" style={{background: activeChat.color}}>{activeChat.avatar}</div><div><strong>{activeChat.name}</strong><span>active now</span></div><div className={`conversation-streak ${activeChat.streakColor}`}><Flame size={14} fill="currentColor"/><b>{activeChat.streak}</b><small>дней</small></div><button type="button" className="more-button" onClick={() => notify("Действия чата скоро будут доступны")} aria-label="Меню чата"><MoreHorizontal size={20}/></button></div><div className="message-space"><div className="day-divider">TODAY</div><div className="bubble received">that sunset video is so good. <br/>the colors are everything ✦<span>18:42</span></div><div className="bubble sent">you get it!! i almost didn’t post it<span>18:43 <Check size={12}/></span></div><div className="bubble received">never hide the good stuff 🌞<span>18:43</span></div>{sentMessages.map((msg, i) => <div className="bubble sent" key={i}>{msg}<span>now <Check size={12}/></span></div>)}</div><div className="message-compose"><button type="button" onClick={() => notify("Вложения скоро будут доступны")} aria-label="Добавить вложение"><Plus size={19}/></button><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && setMessage(current => { if (current.trim()) setSentMessages(prev => [...prev, current.trim()]); return ""; })} placeholder="Написать сообщение..."/><button type="button" className="send-button" onClick={() => { if (!message.trim()) return; setSentMessages(prev => [...prev, message.trim()]); setMessage(""); }} aria-label="Отправить сообщение"><Send size={17}/></button></div></div></div></section>}
      </main>

      <nav className="mobile-nav" aria-label="Мобильная навигация">{navItems.map(item => { const Icon = item.icon; return <button type="button" key={item.id} className={view === item.id ? "active" : ""} onClick={() => setActiveView(item.id as View)}><Icon size={20}/><span>{item.label}</span>{item.id === "chats" && <i/>}</button>; })}<button type="button" className="mobile-upload" onClick={() => setShowUpload(true)} aria-label="Загрузить видео"><Plus size={22}/></button></nav>

      {!loggedIn && <div className={`login-banner ${view === "feed" ? "feed-login-banner" : ""}`}><div><span className="eyebrow">MAKE IT YOURS</span><strong>Зажги свой Glowix</strong></div><button type="button" onClick={() => setShowAuth(true)}>Войти / создать</button></div>}

      {showAuth && <div className="modal-backdrop" onClick={() => setShowAuth(false)}><div className="modal auth-modal" onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowAuth(false)} aria-label="Закрыть"><X size={18}/></button><div className="modal-symbol"><Sparkles size={20}/></div><p className="eyebrow">WELCOME TO GLOWIX</p><h2>Твоё место,<br/><em>твой свет.</em></h2><p className="modal-subtitle">Создай аккаунт и сохраняй свои маленькие моменты в одном тёплом пространстве.</p><label>Email<input type="email" placeholder="you@example.com"/></label><label>Пароль<input type="password" placeholder="••••••••"/></label><button type="button" className="primary-button" onClick={() => { localStorage.setItem("glowix-auth", "1"); setLoggedIn(true); setShowAuth(false); toast.success("Добро пожаловать в Glowix"); }}>Продолжить <ChevronRight size={17}/></button><span className="terms">Продолжая, ты принимаешь правила Glowix</span></div></div>}

      {showUpload && <div className="modal-backdrop" onClick={() => !uploading && setShowUpload(false)}><div className="modal upload-modal" onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => !uploading && setShowUpload(false)} aria-label="Закрыть"><X size={18}/></button><div className="upload-drop"><div className="upload-icon">{uploading ? <LoaderCircle size={22} className="spin"/> : <Upload size={22}/>}</div><h2>Новый момент</h2><p>Загрузи вертикальное видео<br/>до 60 секунд</p><input id="glowix-upload" type="file" accept="video/mp4,video/quicktime,video/*" disabled={uploading} onChange={e => { const file = e.target.files?.[0]; if (file) void uploadVideo(file); e.currentTarget.value = ""; }}/><label className="primary-button" htmlFor="glowix-upload">{uploading ? "Загрузка..." : "Выбрать видео"} <ImagePlus size={17}/></label><small>MP4, MOV · до 100 MB · сохраняется в облаке</small></div></div></div>}

      {showComments && selectedPost && (() => {
        const commentRows = commentsQuery.data ?? [];
        const rootComments = commentRows.filter(comment => !comment.parentId);
        const repliesFor = (commentId: number) => commentRows.filter(comment => comment.parentId === commentId);
        const renderComment = (comment: (typeof commentRows)[number], isReply = false) => <div className={`comment-row ${isReply ? "comment-reply" : ""}`} key={comment.id}><div className="avatar gradient-avatar">{comment.authorName.split(" ").map(part => part[0]).join("")}</div><div className="comment-content"><strong>{comment.authorName}</strong><p>{comment.body}</p><small>{new Date(comment.createdAt).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small><div className="comment-actions"><button type="button" className={`comment-action ${comment.isLiked ? "liked" : ""}`} onClick={() => commentLikeMutation.mutate({ commentId: comment.id, clientId })}><Heart size={14} fill={comment.isLiked ? "currentColor" : "none"}/> {comment.likes}</button><button type="button" className="comment-action" onClick={() => startReply(comment.id, comment.authorName)}><CornerDownRight size={14}/> Ответить</button></div>{repliesFor(comment.id).map(reply => renderComment(reply, true))}</div></div>;
        return <div className="modal-backdrop" onClick={() => setShowComments(false)}><div className="modal comments-modal" onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowComments(false)} aria-label="Закрыть"><X size={18}/></button><p className="eyebrow">JOIN THE GLOW</p><h2>Комментарии</h2><p className="comments-post-caption">{selectedPost.caption}</p><div className="comments-list">{commentsQuery.isLoading ? <div className="comments-loading"><LoaderCircle className="spin" size={18}/> Загружаем комментарии...</div> : rootComments.length ? rootComments.map(comment => renderComment(comment)) : <div className="empty-comments"><MessageCircle size={20}/><span>Пока тихо. Будь первым.</span></div>}</div><div className="comment-compose">{replyingTo && <div className="replying-banner"><CornerDownRight size={14}/> Ответ для {commentRows.find(comment => comment.id === replyingTo)?.authorName || "комментария"}<button type="button" onClick={() => { setReplyingTo(null); setCommentText(""); }} aria-label="Отменить ответ"><X size={14}/></button></div>}<textarea value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitComment(); }} placeholder={replyingTo ? "Напиши ответ..." : "Напиши что-нибудь тёплое..."} rows={3}/><button type="button" className="primary-button" onClick={submitComment} disabled={!commentText.trim() || addCommentMutation.isPending}>{addCommentMutation.isPending ? <LoaderCircle className="spin" size={16}/> : <Send size={16}/>} {replyingTo ? "Ответить" : "Отправить"}</button></div></div></div>;
      })()}

      {showCustomize && <div className="modal-backdrop" onClick={() => setShowCustomize(false)}><div className="modal customize-modal" onClick={e => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowCustomize(false)} aria-label="Закрыть"><X size={18}/></button><p className="eyebrow">MAKE IT YOURS</p><h2>Настроить glow</h2><div className="custom-preview"><div className={`big-fire ${fireStyle}`}><Flame size={38} fill="currentColor"/></div><div><strong>Твоя серия</strong><span>7 дней подряд</span></div><Zap size={18}/></div><p className="field-label">Аватар профиля</p><div className="avatar-options">{avatarOptions.map((url, i) => <button type="button" key={url} className={avatarUrl === url ? "selected" : ""} onClick={() => setAvatarUrl(url)}><img src={url} alt={`Аватар ${i + 1}`}/></button>)}<input id="glowix-avatar-upload" type="file" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatarUrl(String(reader.result)); reader.readAsDataURL(file); }}/><label className="avatar-gallery-button" htmlFor="glowix-avatar-upload"><ImagePlus size={18}/><span>Галерея</span></label></div><p className="field-label">Стиль огонька</p><div className="style-options"><button type="button" className={fireStyle === "ember" ? "selected" : ""} onClick={() => setFireStyle("ember")}><Flame size={20}/><span>Ember</span></button><button type="button" className={fireStyle === "lavender" ? "selected" : ""} onClick={() => setFireStyle("lavender")}><Flame size={20}/><span>Violet</span></button><button type="button" className={fireStyle === "mint" ? "selected" : ""} onClick={() => setFireStyle("mint")}><Flame size={20}/><span>Mint</span></button></div><div className="custom-form"><label>Имя<input value={profileName} onChange={e => setProfileName(e.target.value)}/></label><label>О себе<textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}/></label></div><button type="button" className="primary-button" onClick={() => { localStorage.setItem("glowix-fire", fireStyle); localStorage.setItem("glowix-name", profileName); localStorage.setItem("glowix-bio", bio); localStorage.setItem("glowix-avatar", avatarUrl); setShowCustomize(false); toast.success("Профиль обновлён"); }}>Сохранить изменения <Check size={17}/></button></div></div>}
    </div>
  );
}
