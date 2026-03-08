import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const COURSES = [
  { id: 1, code: "CA-MOT", name: "Installation et réparation de moteurs et de génératrices à c.a.", color: "#6EE7B7", accent: "#059669" },
  { id: 2, code: "LOG-SEQ", name: "Logique séquentielle", color: "#93C5FD", accent: "#2563EB" },
  { id: 3, code: "CC-MOT", name: "Installation et réparation de moteurs et de génératrices à c.c.", color: "#FCA5A5", accent: "#DC2626" },
  { id: 4, code: "TRANS-ACC", name: "Accessoires de transmission et de transformation du mouvement", color: "#FDE68A", accent: "#D97706" },
  { id: 5, code: "TRANS-MEC", name: "Transmissions mécaniques", color: "#C4B5FD", accent: "#7C3AED" },
  { id: 6, code: "AUTO-PLC", name: "Utilisation de l'automate programmable", color: "#FBCFE8", accent: "#DB2777" },
  { id: 7, code: "HYD-CIR", name: "Circuits hydrauliques", color: "#99F6E4", accent: "#0D9488" },
  { id: 8, code: "ELEC-MOT", name: "Installation, réparation : commande électronique de moteurs", color: "#FED7AA", accent: "#EA580C" },
  { id: 9, code: "API-SYS", name: "Système automatisé contrôlé par API", color: "#BAE6FD", accent: "#0284C7" },
  { id: 10, code: "INST-IND", name: "Installation, dépannage : instrumentation industrielle", color: "#D9F99D", accent: "#65A30D" },
];

const MOTIVATIONAL = [
  "🔥 Excellent ! Continuez sur cette lancée !",
  "⚡ Vous maîtrisez ce sujet — passez au suivant !",
  "🌟 Chaque tâche accomplie vous rapproche du succès !",
  "💪 Du travail acharné paie — vous en êtes la preuve !",
  "🎯 Focus laser ! Vous êtes dans la zone !",
  "🚀 En route vers l'excellence !",
  "🏆 La réussite aime la préparation — vous êtes prêt(e) !",
];

const EXAM_DATE = new Date("2026-06-20");

// ─── Storage helpers ───────────────────────────────────────────────────────────
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─── Utility ──────────────────────────────────────────────────────────────────
const daysUntil = (date) => Math.max(0, Math.ceil((date - new Date()) / 86400000));
const fmtDate = (d) => new Date(d).toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
const pad = (n) => String(n).padStart(2, "0");

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    tasks: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    timer: <><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></>,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    check: <polyline points="20 6 9 17 4 12"/>,
    export: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    fire: <path d="M12 2c0 6-8 8-8 14a8 8 0 0016 0c0-6-8-8-8-14z"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    save: <><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
    camera: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name]}
    </svg>
  );
};

// ─── Progress Ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 80, stroke = 7, color = "#6EE7B7" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}/>
    </svg>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimeout;
const ToastContext = ({ toast, setToast }) => {
  useEffect(() => {
    if (toast) { clearTimeout(toastTimeout); toastTimeout = setTimeout(() => setToast(null), 3200); }
  }, [toast]);
  if (!toast) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 9999,
      background: "linear-gradient(135deg,#1a2744,#0f172a)", border: "1px solid rgba(110,231,183,0.3)",
      borderRadius: 16, padding: "14px 22px", color: "#e2e8f0", fontSize: 14, fontWeight: 500,
      boxShadow: "0 24px 48px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp 0.4s cubic-bezier(.34,1.56,.64,1)",
    }}>
      <span style={{ fontSize: 20 }}>{toast.icon}</span>
      <span>{toast.msg}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_USER = { username: "admin", password: "1234" };

function LoginPage({ dark, setDark, onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const bg = dark
    ? { "--bg": "#080d1a", "--surface": "#0f172a", "--card": "#1a2744", "--border": "rgba(255,255,255,0.07)", "--text": "#e2e8f0", "--sub": "#94a3b8" }
    : { "--bg": "#f0f4ff", "--surface": "#ffffff", "--card": "#ffffff", "--border": "rgba(0,0,0,0.08)", "--text": "#0f172a", "--sub": "#64748b" };

  const handleLogin = () => {
    if (!form.username || !form.password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    setTimeout(() => {
      const saved = load("credentials", DEFAULT_USER);
      if (form.username === saved.username && form.password === saved.password) {
        setError("");
        onLogin();
      } else {
        setError("Nom d'utilisateur ou mot de passe incorrect ❌");
      }
      setLoading(false);
    }, 600);
  };

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 12,
    padding: "12px 16px", color: "var(--text)", fontSize: 14, outline: "none",
    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s",
  };

  return (
    <div style={{ ...bg, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .login-input:focus { border-color: rgba(110,231,183,0.6) !important; box-shadow: 0 0 0 3px rgba(110,231,183,0.1); }
        .btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .btn:hover { transform:translateY(-1px); }
        .btn-primary { background:linear-gradient(135deg,#6EE7B7,#34D399); color:#064e3b; }
      `}</style>

      {/* Background decoration */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(110,231,183,0.08),transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: "-20%", left: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(147,197,253,0.06),transparent 70%)" }}/>
      </div>

      <div style={{ width: 420, maxWidth: "95vw", animation: "slideUp 0.5s cubic-bezier(.34,1.56,.64,1)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 70, height: 70, borderRadius: 22, background: "linear-gradient(135deg,#6EE7B7,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 16px", boxShadow: "0 16px 40px rgba(110,231,183,0.3)", animation: "float 3s ease-in-out infinite" }}>🎓</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 6 }}>ExamPrep Tracker</h1>
          <p style={{ color: "var(--sub)", fontSize: 14 }}>Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: 36, boxShadow: dark ? "0 32px 64px rgba(0,0,0,0.4)" : "0 32px 64px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Nom d'utilisateur</label>
              <input
                className="login-input"
                style={inputStyle}
                placeholder="Entrez votre identifiant"
                value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--sub)", display: "block", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  style={{ ...inputStyle, paddingRight: 48 }}
                  type={showPass ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--sub)",
                }}>{showPass ? "🙈" : "👁"}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            {/* Login button */}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 15, marginTop: 4 }}
              onClick={handleLogin} disabled={loading}>
              {loading ? "⏳ Connexion…" : "🔐 Se connecter"}
            </button>
          </div>

          {/* Default credentials hint */}
          <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 12 }}>
            <div style={{ fontSize: 11, color: "var(--sub)", marginBottom: 6, fontWeight: 600 }}>🔑 IDENTIFIANTS PAR DÉFAUT</div>
            <div style={{ fontSize: 12, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>
              Utilisateur : <strong style={{ color: "var(--text)" }}>admin</strong><br/>
              Mot de passe : <strong style={{ color: "var(--text)" }}>1234</strong>
            </div>
            <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 6 }}>⚙️ Modifiez-les dans Profil → Sécurité</div>
          </div>
        </div>

        {/* Dark mode toggle */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sub)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}>
            {dark ? "☀️ Mode clair" : "🌙 Mode sombre"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [dark, setDark] = useState(() => load("dark", true));
  const [tab, setTab] = useState("dashboard");
  const [tasks, setTasks] = useState(() => load("tasks", []));
  const [toast, setToast] = useState(null);
  const [streak, setStreak] = useState(() => load("streak", 0));
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [profile, setProfile] = useState(() => load("profile", {
    name: "Étudiant(e)",
    email: "etudiant@example.com",
    field: "Automatisation industrielle / API",
    examDate: "2026-06-20",
    dailyHours: 3,
    goal: "Préparer l'examen final en 3 mois",
    avatar: null,
  }));
  const [loggedIn, setLoggedIn] = useState(() => load("loggedIn", false));

  useEffect(() => { save("tasks", tasks); }, [tasks]);
  useEffect(() => { save("dark", dark); }, [dark]);
  useEffect(() => { save("profile", profile); }, [profile]);
  useEffect(() => { save("loggedIn", loggedIn); }, [loggedIn]);

  const showToast = (msg, icon = "✅") => setToast({ msg, icon });

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = t.status === "completed" ? "not-started"
        : t.status === "not-started" ? "in-progress"
        : "completed";
      if (next === "completed") {
        showToast(MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);
        setStreak(s => { const ns = s + 1; save("streak", ns); return ns; });
      }
      return { ...t, status: next };
    }));
  };

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, id: Date.now(), status: "not-started" }]);
    showToast("Tâche ajoutée !", "📚");
  };

  const handleSetProfile = (p) => setProfile(p);

  const bg = dark
    ? { "--bg": "#080d1a", "--surface": "#0f172a", "--card": "#1a2744", "--border": "rgba(255,255,255,0.07)", "--text": "#e2e8f0", "--sub": "#94a3b8", "--accent": "#6EE7B7" }
    : { "--bg": "#f0f4ff", "--surface": "#ffffff", "--card": "#ffffff", "--border": "rgba(0,0,0,0.08)", "--text": "#0f172a", "--sub": "#64748b", "--accent": "#059669" };

  const days = daysUntil(EXAM_DATE);
  const done = tasks.filter(t => t.status === "completed").length;
  const total = tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const tabs = [
    { id: "dashboard", label: "Tableau de bord", icon: "dashboard" },
    { id: "tasks", label: "Tâches", icon: "tasks" },
    { id: "calendar", label: "Calendrier", icon: "calendar" },
    { id: "stats", label: "Statistiques", icon: "chart" },
    { id: "profile", label: "Profil", icon: "user" },
  ];

  // ─── Login gate ───────────────────────────────────────────────────────────
  if (!loggedIn) {
    return <LoginPage dark={dark} setDark={setDark} onLogin={() => setLoggedIn(true)}/>;
  }

  return (
    <div style={{ ...bg, minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "'DM Sans', 'Outfit', sans-serif", transition: "all 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 99px; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pop { 0%{transform:scale(0.95)} 60%{transform:scale(1.04)} 100%{transform:scale(1)} }
        .nav-btn { background:none; border:none; cursor:pointer; transition:all 0.2s; }
        .nav-btn:hover { opacity:0.8; }
        .card { background:var(--card); border:1px solid var(--border); border-radius:20px; padding:24px; transition:all 0.3s; }
        .card:hover { border-color:rgba(110,231,183,0.2); box-shadow:0 8px 32px rgba(0,0,0,0.2); }
        .tag { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600; letter-spacing:0.05em; font-family:'DM Mono',monospace; }
        .btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:12px; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; font-family:'DM Sans',sans-serif; }
        .btn:hover { transform:translateY(-1px); }
        .btn-primary { background:linear-gradient(135deg,#6EE7B7,#34D399); color:#064e3b; }
        .btn-ghost { background:var(--border); color:var(--text); border:1px solid var(--border); }
        input, select, textarea { font-family:'DM Sans',sans-serif; }
        .progress-bar { height:8px; background:rgba(255,255,255,0.07); border-radius:99px; overflow:hidden; }
        .progress-fill { height:100%; border-radius:99px; transition:width 0.8s cubic-bezier(.4,0,.2,1); }
        .checkbox { width:22px; height:22px; border-radius:7px; border:2px solid var(--border); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
        .checkbox:hover { border-color:var(--accent); }
        .anim-in { animation:slideUp 0.4s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      {/* Sidebar */}
      <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 220, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 100, padding: "24px 0" }}>
        {/* Logo */}
        <div style={{ padding: "0 20px 28px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6EE7B7,#34D399)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎓</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>ExamPrep</div>
              <div style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>Tracker Pro</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} className="nav-btn" onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
              background: tab === t.id ? "linear-gradient(135deg,rgba(110,231,183,0.15),rgba(52,211,153,0.08))" : "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--sub)", fontWeight: tab === t.id ? 600 : 400,
              fontSize: 14, textAlign: "left", border: tab === t.id ? "1px solid rgba(110,231,183,0.2)" : "1px solid transparent",
            }}>
              <Icon name={t.icon} size={16}/>{t.label}
            </button>
          ))}
          <button className="nav-btn" onClick={() => setPomodoroOpen(true)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12,
            background: "transparent", color: "var(--sub)", fontSize: 14, textAlign: "left", border: "1px solid transparent", marginTop: 4,
          }}>
            <Icon name="timer" size={16}/>Pomodoro
          </button>
        </nav>

        {/* Bottom */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Avatar mini */}
          <button className="nav-btn" onClick={() => setTab("profile")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(110,231,183,0.4)", flexShrink: 0, background: "linear-gradient(135deg,#6EE7B7,#34D399)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {profile.avatar
                ? <img src={profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                : <span style={{ fontSize: 14, color: "#064e3b" }}>👤</span>}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name}</div>
              <div style={{ fontSize: 10, color: "var(--sub)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.field.split("/")[0].trim()}</div>
            </div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--sub)" }}>Série : <strong style={{ color: "#fb923c" }}>{streak} 🔥</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "var(--sub)" }}>Mode</span>
            <button className="nav-btn" onClick={() => setDark(!dark)} style={{ color: "var(--sub)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
              <Icon name={dark ? "sun" : "moon"} size={14}/>{dark ? "Clair" : "Sombre"}
            </button>
          </div>
          <button className="nav-btn" onClick={() => { setLoggedIn(false); setTab("dashboard"); }} style={{
            display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 12, padding: "6px 0", width: "100%",
          }}>
            <span>🚪</span> Se déconnecter
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: 220, padding: "32px", minHeight: "100vh" }}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
              {tabs.find(t => t.id === tab)?.label}
            </h1>
            <p style={{ color: "var(--sub)", fontSize: 13, marginTop: 3 }}>
              {new Date().toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "8px 16px" }}>
              <span style={{ fontSize: 20 }}>⏰</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: days <= 14 ? "#f87171" : "var(--accent)", lineHeight: 1 }}>{days}j</div>
                <div style={{ fontSize: 10, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>jusqu'à l'exam</div>
              </div>
            </div>
            {(tab === "tasks" || tab === "dashboard") && (
              <button className="btn btn-primary" onClick={() => setAddOpen(true)}><Icon name="plus" size={15}/>Ajouter</button>
            )}
          </div>
        </div>

        {/* Views */}
        {tab === "dashboard" && <Dashboard tasks={tasks} toggleTask={toggleTask} pct={pct} done={done} total={total} days={days} dark={dark}/>}
        {tab === "tasks" && <Tasks tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} dark={dark}/>}
        {tab === "calendar" && <CalendarView tasks={tasks} setTasks={setTasks} dark={dark}/>}
        {tab === "stats" && <Stats tasks={tasks} dark={dark}/>}
        {tab === "profile" && <Profile profile={profile} setProfile={handleSetProfile} tasks={tasks} dark={dark} showToast={showToast} onLogout={() => { setLoggedIn(false); setTab("dashboard"); }}/>}
      </div>

      {/* Modals */}
      {addOpen && <AddTaskModal onAdd={addTask} onClose={() => setAddOpen(false)} dark={dark}/>}
      {pomodoroOpen && <PomodoroModal onClose={() => setPomodoroOpen(false)} dark={dark} showToast={showToast}/>}
      <ToastContext toast={toast} setToast={setToast}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ tasks, toggleTask, pct, done, total, days, dark }) {
  const coursePcts = COURSES.map(c => {
    const ct = tasks.filter(t => t.courseId === c.id);
    const cd = ct.filter(t => t.status === "completed").length;
    return { ...c, pct: ct.length ? Math.round((cd / ct.length) * 100) : 0, total: ct.length, done: cd };
  });
  const recent = [...tasks].filter(t => t.status !== "completed").slice(0, 5);
  const hours = tasks.filter(t => t.status === "completed").reduce((s, t) => s + (t.hours || 0), 0);

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { label: "Progression globale", val: `${pct}%`, icon: "⚡", color: "#6EE7B7", sub: `${done}/${total} tâches` },
          { label: "Jours restants", val: days, icon: "📅", color: days <= 14 ? "#f87171" : "#93C5FD", sub: `Examen le 20 juin` },
          { label: "Heures étudiées", val: `${hours}h`, icon: "⏱", color: "#FDE68A", sub: "Tâches complétées" },
          { label: "Série actuelle", val: `${0}🔥`, icon: "🏆", color: "#FBCFE8", sub: "Tâches consécutives" },
        ].map((k, i) => (
          <div key={i} className="card anim-in" style={{ animationDelay: `${i * 0.07}s`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -10, fontSize: 52, opacity: 0.08 }}>{k.icon}</div>
            <div style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 6, fontFamily: "'DM Mono',monospace" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 24 }}>
        {/* Course progress */}
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Progression par cours</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {coursePcts.map((c, i) => (
              <div key={c.id} className="anim-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }}/>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{c.code}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>{c.done}/{c.total}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: c.color, minWidth: 32, textAlign: "right" }}>{c.pct}%</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.pct}%`, background: `linear-gradient(90deg,${c.color}88,${c.color})` }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overall ring + recent tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <ProgressRing pct={pct} size={90} stroke={8}/>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: "var(--accent)" }}>{pct}%</div>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Progression globale</div>
              <div style={{ color: "var(--sub)", fontSize: 13, marginTop: 4 }}>{done} tâche{done !== 1 ? "s" : ""} terminée{done !== 1 ? "s" : ""}</div>
              <div style={{ color: "var(--sub)", fontSize: 13 }}>{total - done} restante{total - done !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>Prochaines tâches</h3>
            {recent.length === 0 ? (
              <div style={{ color: "var(--sub)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Aucune tâche en attente 🎉</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recent.map(t => {
                  const c = COURSES.find(c => c.id === t.courseId);
                  return (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <StatusDot status={t.status}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</div>
                        <div style={{ fontSize: 11, color: c?.color || "var(--sub)" }}>{c?.code}</div>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>{t.hours}h</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════════
function StatusDot({ status }) {
  const colors = { completed: "#6EE7B7", "in-progress": "#FDE68A", "not-started": "#f87171" };
  return <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[status], flexShrink: 0, boxShadow: `0 0 6px ${colors[status]}88` }}/>;
}

function Tasks({ tasks, toggleTask, deleteTask, dark }) {
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState(0);

  const filtered = tasks.filter(t => {
    if (filter !== "all" && t.status !== filter) return false;
    if (courseFilter && t.courseId !== courseFilter) return false;
    return true;
  });

  const statusLabel = { "not-started": "Non commencé", "in-progress": "En cours", completed: "Terminé" };
  const statusBg = { "not-started": "rgba(248,113,113,0.15)", "in-progress": "rgba(253,230,138,0.15)", completed: "rgba(110,231,183,0.15)" };
  const statusColor = { "not-started": "#f87171", "in-progress": "#fbbf24", completed: "#6EE7B7" };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {["all", "not-started", "in-progress", "completed"].map(s => (
          <button key={s} className="btn" onClick={() => setFilter(s)} style={{
            background: filter === s ? "linear-gradient(135deg,#6EE7B7,#34D399)" : "var(--card)",
            color: filter === s ? "#064e3b" : "var(--sub)",
            border: filter === s ? "none" : "1px solid var(--border)",
            padding: "7px 16px", fontSize: 13,
          }}>
            {s === "all" ? "Tous" : statusLabel[s]}
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, opacity: 0.7 }}>
              {tasks.filter(t => s === "all" || t.status === s).length}
            </span>
          </button>
        ))}
        <select value={courseFilter} onChange={e => setCourseFilter(+e.target.value)} style={{
          background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 12,
          padding: "7px 14px", fontSize: 13, cursor: "pointer",
        }}>
          <option value={0}>Tous les cours</option>
          {COURSES.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
        </select>
      </div>

      {/* Task list */}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--sub)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            Aucune tâche trouvée
          </div>
        )}
        {filtered.map((t, i) => {
          const c = COURSES.find(c => c.id === t.courseId);
          return (
            <div key={t.id} className="card anim-in" style={{
              animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 16,
              opacity: t.status === "completed" ? 0.7 : 1,
              borderLeft: `3px solid ${c?.color || "var(--border)"}`,
            }}>
              {/* Checkbox */}
              <div className="checkbox" onClick={() => toggleTask(t.id)} style={{
                background: t.status === "completed" ? "linear-gradient(135deg,#6EE7B7,#34D399)" : "transparent",
                borderColor: t.status === "completed" ? "#6EE7B7" : t.status === "in-progress" ? "#fbbf24" : "var(--border)",
              }}>
                {t.status === "completed" && <Icon name="check" size={13} style={{ color: "#064e3b" }}/>}
                {t.status === "in-progress" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }}/>}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, textDecoration: t.status === "completed" ? "line-through" : "none", color: t.status === "completed" ? "var(--sub)" : "var(--text)" }}>{t.topic}</span>
                  <span className="tag" style={{ background: statusBg[t.status], color: statusColor[t.status] }}>{statusLabel[t.status]}</span>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: c?.color || "var(--sub)", fontWeight: 600 }}>{c?.code}</span>
                  {t.date && <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>📅 {fmtDate(t.date)}</span>}
                  <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>⏱ {t.hours}h</span>
                </div>
              </div>

              <button className="nav-btn" onClick={() => deleteTask(t.id)} style={{ color: "var(--sub)", padding: 6 }}>
                <Icon name="trash" size={15}/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════════════════════
function CalendarView({ tasks, setTasks, dark }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString("fr-CA", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getDateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const tasksFor = (d) => tasks.filter(t => t.date === getDateStr(d));

  const handleDrop = (d) => {
    if (dragging == null) return;
    setTasks(prev => prev.map(t => t.id === dragging ? { ...t, date: getDateStr(d) } : t));
    setDragging(null);
  };

  const today = new Date();

  return (
    <div>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <button className="btn btn-ghost" onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); }}>‹</button>
        <h2 style={{ fontWeight: 700, fontSize: 20, flex: 1, textAlign: "center", textTransform: "capitalize" }}>{monthName}</h2>
        <button className="btn btn-ghost" onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); }}>›</button>
      </div>

      {/* Weekdays */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: 6 }}>
        {["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--sub)", padding: "6px 0", fontFamily: "'DM Mono',monospace" }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6 }}>
        {cells.map((d, i) => {
          const isToday = d && today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
          const dayTasks = d ? tasksFor(d) : [];
          const isSelected = selected === d;
          return (
            <div key={i} onDragOver={d ? e => e.preventDefault() : undefined} onDrop={d ? () => handleDrop(d) : undefined}
              onClick={() => d && setSelected(isSelected ? null : d)}
              style={{
                minHeight: 80, borderRadius: 12, padding: 8, cursor: d ? "pointer" : "default",
                background: isToday ? "linear-gradient(135deg,rgba(110,231,183,0.15),rgba(52,211,153,0.05))"
                  : isSelected ? "rgba(110,231,183,0.08)"
                  : d ? "var(--card)" : "transparent",
                border: isToday ? "1px solid rgba(110,231,183,0.4)" : isSelected ? "1px solid rgba(110,231,183,0.2)" : "1px solid var(--border)",
                transition: "all 0.2s",
              }}>
              {d && <>
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? "#6EE7B7" : "var(--sub)", marginBottom: 4 }}>{d}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayTasks.slice(0, 3).map(t => {
                    const c = COURSES.find(c => c.id === t.courseId);
                    return (
                      <div key={t.id} draggable onDragStart={() => setDragging(t.id)} style={{
                        fontSize: 9, background: `${c?.color || "#6EE7B7"}22`, color: c?.color || "#6EE7B7",
                        borderRadius: 5, padding: "2px 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        cursor: "grab", fontFamily: "'DM Mono',monospace",
                      }}>{t.topic}</div>
                    );
                  })}
                  {dayTasks.length > 3 && <div style={{ fontSize: 9, color: "var(--sub)" }}>+{dayTasks.length - 3}</div>}
                </div>
              </>}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 14, fontSize: 15 }}>Tâches du {selected} {new Date(year, month).toLocaleDateString("fr-CA", { month: "long" })}</h3>
          {tasksFor(selected).length === 0
            ? <p style={{ color: "var(--sub)", fontSize: 13 }}>Aucune tâche planifiée</p>
            : tasksFor(selected).map(t => {
                const c = COURSES.find(c => c.id === t.courseId);
                return <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <StatusDot status={t.status}/>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{t.topic}</div><div style={{ fontSize: 11, color: c?.color }}>{c?.code}</div></div>
                  <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>{t.hours}h</span>
                </div>;
              })
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════
function Stats({ tasks }) {
  const done = tasks.filter(t => t.status === "completed");
  const totalHours = done.reduce((s, t) => s + (t.hours || 0), 0);
  const completionRate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  const byWeek = {};
  done.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    const week = `S${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString("fr-CA", { month: "short" })}`;
    byWeek[week] = (byWeek[week] || 0) + (t.hours || 0);
  });

  const byCourse = COURSES.map(c => {
    const ct = tasks.filter(t => t.courseId === c.id);
    const cd = ct.filter(t => t.status === "completed");
    return { ...c, rate: ct.length ? Math.round((cd.length / ct.length) * 100) : 0, hours: cd.reduce((s, t) => s + (t.hours || 0), 0) };
  }).sort((a, b) => b.hours - a.hours);

  const maxHours = Math.max(...byCourse.map(c => c.hours), 1);
  const most = byCourse[0];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {[
          { label: "Heures totales", val: `${totalHours}h`, icon: "⏱", color: "#FDE68A" },
          { label: "Taux de complétion", val: `${completionRate}%`, icon: "✅", color: "#6EE7B7" },
          { label: "Cours le + étudié", val: most?.code || "—", icon: "🏆", color: "#FBCFE8" },
        ].map((k, i) => (
          <div key={i} className="card anim-in" style={{ animationDelay: `${i * 0.07}s` }}>
            <div style={{ fontSize: 12, color: "var(--sub)", marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Bar chart per course */}
      <div className="card">
        <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Heures étudiées par cours</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {byCourse.map(c => (
            <div key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color }}/>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{c.code}</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>{c.hours}h</span>
                  <span style={{ fontSize: 11, color: c.color, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{c.rate}%</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(c.hours / maxHours) * 100}%`, background: `linear-gradient(90deg,${c.color}66,${c.color})` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly hours */}
      {Object.keys(byWeek).length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Heures par semaine</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
            {Object.entries(byWeek).map(([w, h]) => {
              const maxW = Math.max(...Object.values(byWeek));
              return (
                <div key={w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--sub)", fontFamily: "'DM Mono',monospace" }}>{h}h</span>
                  <div style={{ width: "100%", background: "linear-gradient(180deg,#6EE7B7,#34D399)", borderRadius: "6px 6px 0 0", height: `${(h / maxW) * 80}px`, transition: "height 0.6s ease" }}/>
                  <span style={{ fontSize: 9, color: "var(--sub)", fontFamily: "'DM Mono',monospace", textAlign: "center" }}>{w}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(byWeek).length === 0 && tasks.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48, color: "var(--sub)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          Complétez des tâches pour voir vos statistiques
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD TASK MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function AddTaskModal({ onAdd, onClose, dark }) {
  const [form, setForm] = useState({ courseId: 1, topic: "", hours: 1, date: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px",
    color: "var(--text)", fontSize: 14, outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card anim-in" style={{ width: 480, maxWidth: "95vw", padding: 32 }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Nouvelle tâche d'étude</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--sub)", display: "block", marginBottom: 6 }}>Cours</label>
            <select value={form.courseId} onChange={e => set("courseId", +e.target.value)} style={inputStyle}>
              {COURSES.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name.slice(0, 40)}…</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--sub)", display: "block", marginBottom: 6 }}>Sujet / Thème</label>
            <input value={form.topic} onChange={e => set("topic", e.target.value)} placeholder="Ex: Principes de base du moteur asynchrone" style={inputStyle}/>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--sub)", display: "block", marginBottom: 6 }}>Durée estimée (h)</label>
              <input type="number" min={0.5} max={12} step={0.5} value={form.hours} onChange={e => set("hours", +e.target.value)} style={inputStyle}/>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--sub)", display: "block", marginBottom: 6 }}>Date planifiée</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} style={inputStyle}/>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => {
            if (!form.topic.trim()) return;
            onAdd(form); onClose();
          }}>
            <Icon name="plus" size={15}/>Ajouter la tâche
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POMODORO MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function PomodoroModal({ onClose, dark, showToast }) {
  const MODES = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [mode, setMode] = useState("work");
  const [secs, setSecs] = useState(MODES.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) {
            clearInterval(ref.current); setRunning(false);
            const m = mode === "work" ? "🍅 Pomodoro terminé ! Prenez une pause." : "⚡ Pause terminée ! Au travail !";
            showToast(m);
            if (mode === "work") setSessions(n => n + 1);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const switchMode = (m) => { setMode(m); setSecs(MODES[m]); setRunning(false); };
  const pct = ((MODES[mode] - secs) / MODES[mode]) * 100;
  const modeColors = { work: "#f87171", short: "#6EE7B7", long: "#93C5FD" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card anim-in" style={{ width: 360, padding: 36, textAlign: "center" }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 24 }}>🍅 Pomodoro</h2>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          {[["work","Travail"],["short","Courte"],["long","Longue"]].map(([m, l]) => (
            <button key={m} className="btn" onClick={() => switchMode(m)} style={{
              background: mode === m ? modeColors[m] + "33" : "var(--card)", color: mode === m ? modeColors[m] : "var(--sub)",
              border: `1px solid ${mode === m ? modeColors[m] + "66" : "var(--border)"}`, padding: "6px 14px", fontSize: 12,
            }}>{l}</button>
          ))}
        </div>
        <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <ProgressRing pct={pct} size={160} stroke={10} color={modeColors[mode]}/>
          <div style={{ position: "absolute" }}>
            <div style={{ fontSize: 44, fontWeight: 800, fontFamily: "'DM Mono',monospace", letterSpacing: "-0.03em", color: modeColors[mode] }}>
              {pad(Math.floor(secs / 60))}:{pad(secs % 60)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={() => { setSecs(MODES[mode]); setRunning(false); }}>↺ Reset</button>
          <button className="btn" style={{ background: running ? "#f87171" : "linear-gradient(135deg,#6EE7B7,#34D399)", color: running ? "#fff" : "#064e3b", minWidth: 100 }}
            onClick={() => setRunning(!running)}>{running ? "⏸ Pause" : "▶ Start"}</button>
        </div>
        <div style={{ marginTop: 20, fontSize: 13, color: "var(--sub)" }}>
          Sessions complétées : <strong style={{ color: "#fb923c" }}>{sessions} 🍅</strong>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function Profile({ profile, setProfile, tasks, dark, showToast, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const fileRef = useRef(null);

  const done = tasks.filter(t => t.status === "completed").length;
  const totalHours = tasks.filter(t => t.status === "completed").reduce((s, t) => s + (t.hours || 0), 0);
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const activeCourses = [...new Set(tasks.map(t => t.courseId))].length;
  const days = Math.max(0, Math.ceil((new Date(profile.examDate) - new Date()) / 86400000));

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
    padding: "10px 14px", color: "var(--text)", fontSize: 14, outline: "none",
  };

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
    showToast("Profil sauvegardé !", "💾");
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const avatar = ev.target.result;
      setForm(f => ({ ...f, avatar }));
      if (!editing) setProfile(p => ({ ...p, avatar }));
      showToast("Photo mise à jour !", "📸");
    };
    reader.readAsDataURL(file);
  };

  const stats = [
    { label: "Tâches terminées", val: done, icon: "✅", color: "#6EE7B7" },
    { label: "Heures étudiées", val: `${totalHours}h`, icon: "⏱", color: "#FDE68A" },
    { label: "Progression", val: `${pct}%`, icon: "📈", color: "#93C5FD" },
    { label: "Cours actifs", val: activeCourses, icon: "📚", color: "#FBCFE8" },
  ];

  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 860 }}>
      {/* Profile Card */}
      <div className="card anim-in" style={{ display: "flex", gap: 32, alignItems: "flex-start", position: "relative", overflow: "hidden" }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(135deg,rgba(110,231,183,0.12),rgba(52,211,153,0.06))", borderRadius: "20px 20px 0 0" }}/>

        {/* Avatar */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 8 }}>
          <div style={{
            width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
            border: "3px solid rgba(110,231,183,0.5)", background: "linear-gradient(135deg,#6EE7B7,#34D399)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 8px 32px rgba(110,231,183,0.2)",
          }}>
            {(editing ? form.avatar : profile.avatar)
              ? <img src={editing ? form.avatar : profile.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              : <span style={{ fontSize: 42 }}>👤</span>}
          </div>
          <button onClick={() => fileRef.current?.click()} style={{
            position: "absolute", bottom: 2, right: 2, width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg,#6EE7B7,#34D399)", border: "2px solid var(--card)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Icon name="camera" size={13} style={{ color: "#064e3b" }}/>
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatar}/>
        </div>

        {/* Info */}
        <div style={{ flex: 1, zIndex: 1, marginTop: 8 }}>
          {editing ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Nom complet</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Email</label>
                  <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Domaine d'étude</label>
                  <input value={form.field} onChange={e => setForm(f => ({ ...f, field: e.target.value }))} style={inputStyle}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Date d'examen</label>
                  <input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} style={inputStyle}/>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Objectif quotidien (heures)</label>
                  <input type="number" min={0.5} max={16} step={0.5} value={form.dailyHours} onChange={e => setForm(f => ({ ...f, dailyHours: +e.target.value }))} style={inputStyle}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 5 }}>Objectif d'étude</label>
                  <input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} style={inputStyle}/>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setForm({ ...profile }); setEditing(false); }}>Annuler</button>
                <button className="btn btn-primary" onClick={handleSave}><Icon name="save" size={14}/>Sauvegarder</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>{profile.name}</h2>
                <button className="btn btn-ghost" onClick={() => setEditing(true)} style={{ padding: "5px 12px", fontSize: 12 }}>
                  <Icon name="edit" size={13}/>Modifier
                </button>
              </div>
              <div style={{ color: "var(--sub)", fontSize: 13, marginBottom: 12 }}>{profile.email}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                <span className="tag" style={{ background: "rgba(110,231,183,0.12)", color: "#6EE7B7" }}>📐 {profile.field}</span>
                <span className="tag" style={{ background: "rgba(147,197,253,0.12)", color: "#93C5FD" }}>📅 Examen : {new Date(profile.examDate).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="tag" style={{ background: "rgba(253,230,138,0.12)", color: "#fbbf24" }}>⏰ {days}j restants</span>
                <span className="tag" style={{ background: "rgba(251,207,232,0.12)", color: "#f472b6" }}>🎯 {profile.dailyHours}h/jour</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--sub)", fontStyle: "italic", borderLeft: "3px solid rgba(110,231,183,0.3)", paddingLeft: 12 }}>
                "{profile.goal}"
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} className="card anim-in" style={{ animationDelay: `${i * 0.07}s`, textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -8, right: -8, fontSize: 44, opacity: 0.07 }}>{s.icon}</div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress section */}
      <div className="card anim-in" style={{ animationDelay: "0.2s" }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Progression vers l'objectif</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ProgressRing pct={pct} size={110} stroke={10} color="#6EE7B7"/>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1, color: "#6EE7B7" }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "var(--sub)" }}>terminé</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--sub)" }}>Tâches complétées</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{done}/{tasks.length}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6EE7B7,#34D399)" }}/>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--sub)" }}>Objectif quotidien</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Mono',monospace" }}>{profile.dailyHours}h/jour</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (totalHours / (profile.dailyHours * 90)) * 100)}%`, background: "linear-gradient(90deg,#FDE68A,#fbbf24)" }}/>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: "var(--sub)" }}>
                ⚡ Encore <strong style={{ color: "var(--text)" }}>{tasks.length - done}</strong> tâche{tasks.length - done !== 1 ? "s" : ""} pour terminer
              </div>
              <div style={{ fontSize: 12, color: "var(--sub)" }}>
                🏁 <strong style={{ color: "var(--text)" }}>{days}</strong> jours jusqu'à l'examen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security card */}
      <SecurityCard showToast={showToast} onLogout={onLogout}/>
    </div>
  );
}

// ─── Security Card ────────────────────────────────────────────────────────────
function SecurityCard({ showToast, onLogout }) {
  const [form, setForm] = useState({ username: "", oldPass: "", newPass: "", confirm: "" });
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const inputStyle = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10,
    padding: "10px 14px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif",
  };

  const handleSave = () => {
    const saved = load("credentials", { username: "admin", password: "1234" });
    if (!form.username || !form.oldPass || !form.newPass || !form.confirm) { setError("Tous les champs sont obligatoires."); return; }
    if (form.oldPass !== saved.password) { setError("Ancien mot de passe incorrect ❌"); return; }
    if (form.newPass !== form.confirm) { setError("Les mots de passe ne correspondent pas ❌"); return; }
    if (form.newPass.length < 4) { setError("Le mot de passe doit contenir au moins 4 caractères."); return; }
    save("credentials", { username: form.username, password: form.newPass });
    setError("");
    setForm({ username: "", oldPass: "", newPass: "", confirm: "" });
    setOpen(false);
    showToast("Identifiants mis à jour ! Reconnectez-vous.", "🔐");
    setTimeout(() => onLogout(), 1800);
  };

  return (
    <div className="card anim-in" style={{ animationDelay: "0.3s" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: open ? 20 : 0 }}>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: 15 }}>🔐 Sécurité</h3>
          <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 4 }}>Modifier votre nom d'utilisateur et mot de passe</p>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => { setOpen(!open); setError(""); }}>
          {open ? "Annuler" : "Modifier"}
        </button>
      </div>

      {open && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 6 }}>Nouveau nom d'utilisateur</label>
            <input style={inputStyle} placeholder="Nouveau identifiant" value={form.username} onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(""); }}/>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 6 }}>Ancien mot de passe</label>
            <input type="password" style={inputStyle} placeholder="••••••" value={form.oldPass} onChange={e => { setForm(f => ({ ...f, oldPass: e.target.value })); setError(""); }}/>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 6 }}>Nouveau mot de passe</label>
            <input type="password" style={inputStyle} placeholder="••••••" value={form.newPass} onChange={e => { setForm(f => ({ ...f, newPass: e.target.value })); setError(""); }}/>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, color: "var(--sub)", display: "block", marginBottom: 6 }}>Confirmer le mot de passe</label>
            <input type="password" style={inputStyle} placeholder="••••••" value={form.confirm} onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError(""); }}/>
          </div>
          {error && (
            <div style={{ gridColumn: "1/-1", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#f87171" }}>
              {error}
            </div>
          )}
          <div style={{ gridColumn: "1/-1" }}>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleSave}>
              <Icon name="save" size={14}/>Sauvegarder les identifiants
            </button>
          </div>
        </div>
      )}
    </div>
  );
}