import { useEffect, useMemo, useRef, useState } from "react";
import { UI, SCHEMES, STATES } from "./data.js";

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const useStored = (k, d) => {
  const [v, setV] = useState(() => load(k, d));
  useEffect(() => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }, [k, v]);
  return [v, setV];
};
const EMOJI = { nsp: "🎓", apschol: "📚", kisan: "🌾", pmjay: "🏥", pmay: "🏠", skill: "🛠️", ssy: "👧" };

export default function App() {
  const [lang, setLang] = useStored("cp_lang", "te");
  const [page, setPage] = useState("landing");
  const [current, setCurrent] = useState(null);
  const [profile, setProfile] = useStored("cp_profile", null);
  const [saved, setSaved] = useStored("cp_saved", []);
  const [checks, setChecks] = useStored("cp_checks", {});
  const t = UI[lang];
  const go = (p, s) => { setPage(p); if (s) setCurrent(s); window.scrollTo(0, 0); };
  const toggleSave = (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const ctx = { t, lang, go, saved, toggleSave, profile, checks, setChecks };

  return (
    <div className={lang === "te" ? "te" : lang === "hi" ? "hi" : ""}>
      <header className="nav">
        <button className="brand" onClick={() => go("landing")}><span className="logo">CP</span>{t.brand}</button>
        <nav>
          {[["dashboard", t.dash], ["profile", t.profile], ["chat", t.chat], ["saved", `${t.saved} (${saved.length})`]].map(([p, l]) => (
            <button key={p} className={page === p ? "active" : ""} onClick={() => go(p)}>{l}</button>
          ))}
        </nav>
        <div className="lang" role="group" aria-label="Language">
          <button className={lang === "te" ? "on" : ""} onClick={() => setLang("te")}>తెలుగు</button>
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "hi" ? "on" : ""} onClick={() => setLang("hi")}>हिन्दी</button>
        </div>
      </header>
      <main>
        {page === "landing" && <Landing {...ctx} />}
        {page === "dashboard" && <Dashboard {...ctx} />}
        {page === "profile" && <ProfileForm {...ctx} setProfile={setProfile} />}
        {page === "detail" && current && <Detail {...ctx} scheme={SCHEMES.find((s) => s.id === current)} />}
        {page === "chat" && <Chat {...ctx} />}
        {page === "saved" && <Saved {...ctx} />}
      </main>
      <footer className="foot">{t.privacy} · {t.verifyNote}</footer>
    </div>
  );
}

function Landing({ t, go }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>{t.tagline}</h1>
        <p>{t.mandal}</p>
        <button className="cta" onClick={() => go("profile")}>{t.start}</button>
      </div>
      <div className="hero-cards">
        {[["🌐", t.f1], ["🎯", t.f2], ["✅", t.f3], ["🤖", t.f4]].map(([i, l]) => (
          <div className="mini" key={l}><span>{i}</span>{l}</div>
        ))}
      </div>
    </section>
  );
}

function ProfileForm({ t, lang, go, profile, setProfile }) {
  const [f, setF] = useState(profile || { age: "", state: "Andhra Pradesh", district: "", education: "", occupation: "", income: "", category: "", gender: "" });
  const [ok, setOk] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => { e.preventDefault(); setProfile(f); setOk(true); setTimeout(() => go("dashboard"), 700); };
  const sel = (k, opts, optional) => (
    <select value={f[k]} onChange={set(k)} required={!optional}>
      <option value="">{optional ? t.skip : "—"}</option>
      {Object.entries(opts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
  return (
    <form className="card form" onSubmit={submit}>
      <h2>{t.profile}</h2>
      <label>{t.age}<input type="number" min="1" max="110" required value={f.age} onChange={set("age")} /></label>
      <label>{t.state}<select value={f.state} onChange={set("state")}>{STATES.map((s) => <option key={s} value={s}>{lang === "hi" ? (s === "Andhra Pradesh" ? "आंध्र प्रदेश" : s === "Telangana" ? "तेलंगाना" : "अन्य") : lang === "te" ? (s === "Andhra Pradesh" ? "ఆంధ్రప్రదేశ్" : s === "Telangana" ? "తెలంగాణ" : "ఇతర") : s}</option>)}</select></label>
      <label>{t.district}<input value={f.district} onChange={set("district")} /></label>
      <label>{t.edu}{sel("education", t.edus)}</label>
      <label>{t.occ}{sel("occupation", t.occs)}</label>
      <label>{t.income}<input type="number" min="0" value={f.income} onChange={set("income")} placeholder={t.skip} /></label>
      <label>{t.category}{sel("category", t.cats, true)}</label>
      <label>{t.gender}{sel("gender", t.genders, true)}</label>
      <button className="cta" type="submit">{t.save}</button>
      {ok && <p className="ok">✔ {t.saveOk}</p>}
      <p className="note">{t.privacy}</p>
    </form>
  );
}

function SchemeCard({ s, t, lang, go, saved, toggleSave, why }) {
  const on = saved.includes(s.id);
  return (
    <article className="card scheme">
      <div className="emoji">{EMOJI[s.id]}</div>
      <h3>{s.name[lang]}</h3>
      <p className="dept">{s.dept[lang]}</p>
      <p>{s.benefit[lang]}</p>
      {why && <span className="badge">✔ {t.matchWhy}</span>}
      <span className="badge warn">{t.sample}</span>
      <div className="row">
        <button className="cta small" onClick={() => go("detail", s.id)}>{t.details}</button>
        <button className={"ghost" + (on ? " on" : "")} onClick={() => toggleSave(s.id)} aria-pressed={on}>{on ? "★ " + t.bookmarked : "☆ " + t.bookmark}</button>
      </div>
    </article>
  );
}

function Dashboard(ctx) {
  const { t, lang, profile, go } = ctx;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const matched = useMemo(() => (profile ? SCHEMES.filter((s) => s.match(profile)) : []), [profile]);
  const list = SCHEMES.filter((s) => {
    const text = (s.name.en + s.name.te + s.name.hi + s.benefit.en + s.benefit.te + s.benefit.hi + s.dept.en + s.dept.te + s.dept.hi).toLowerCase();
    return (cat === "all" || s.cats.includes(cat)) && text.includes(q.trim().toLowerCase());
  });
  const searching = q.trim() !== "" || cat !== "all";
  return (
    <>
      <div className="welcome">
        <h2>{t.welcome}{profile ? `, ${t.occs[profile.occupation] || ""}` : ""} 👋</h2>
        <input className="search" placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.search} />
        <div className="chips">
          {["all", ...Object.keys(t.filters)].map((c) => (
            <button key={c} className={cat === c ? "chip on" : "chip"} onClick={() => setCat(c)}>{c === "all" ? t.all : t.filters[c]}</button>
          ))}
        </div>
      </div>
      {!searching && (
        <>
          <h3 className="sec">{t.recommended}</h3>
          {profile ? (
            <div className="grid">{matched.map((s) => <SchemeCard key={s.id} s={s} why {...ctx} />)}</div>
          ) : (
            <div className="card empty"><p>{t.noProfile}</p><button className="cta small" onClick={() => go("profile")}>{t.fillProfile}</button></div>
          )}
          <h3 className="sec">{t.popular}</h3>
        </>
      )}
      <div className="grid">
        {(searching ? list : SCHEMES.filter((s) => s.popular)).map((s) => <SchemeCard key={s.id} s={s} {...ctx} />)}
      </div>
      {searching && list.length === 0 && <p className="empty">{t.noResults}</p>}
    </>
  );
}

function Detail({ t, lang, scheme: s, go, saved, toggleSave, checks, setChecks }) {
  if (!s) return null;
  const mine = checks[s.id] || {};
  const done = s.docs.filter((_, i) => mine[i]).length;
  const tick = (i) => setChecks({ ...checks, [s.id]: { ...mine, [i]: !mine[i] } });
  const on = saved.includes(s.id);
  return (
    <div className="detail">
      <button className="ghost" onClick={() => go("dashboard")}>← {t.back}</button>
      <div className="card">
        <div className="row between">
          <h2>{EMOJI[s.id]} {s.name[lang]}</h2>
          <button className={"ghost" + (on ? " on" : "")} onClick={() => toggleSave(s.id)}>{on ? "★ " + t.bookmarked : "☆ " + t.bookmark}</button>
        </div>
        <p className="dept">{t.dept}: {s.dept[lang]}</p>
        <div className="warnbox">⚠ {t.verifyNote}<br /><small>{t.notVerified}</small></div>
        <h3>{t.benefits}</h3><p>{s.benefit[lang]}</p>
        <h3>{t.elig}</h3><p>{s.elig[lang]}</p>
        <h3>{t.docs} <span className="count">{done}/{s.docs.length} {t.checkProgress}</span></h3>
        <div className="bar"><i style={{ width: `${(done / s.docs.length) * 100}%` }} /></div>
        <ul className="checks">
          {s.docs.map((d, i) => (
            <li key={i}><label><input type="checkbox" checked={!!mine[i]} onChange={() => tick(i)} /> {d[lang]}</label></li>
          ))}
        </ul>
        <h3>{t.steps}</h3>
        <ol className="steps">{s.steps.map((x, i) => <li key={i}>{x[lang]}</li>)}</ol>
        <a className="cta" href={s.url} target="_blank" rel="noreferrer noopener">{t.official} ↗</a>
      </div>
    </div>
  );
}

function answer(q, lang, t) {
  const text = q.toLowerCase();
  const s = SCHEMES.find((x) => x.kw.some((k) => text.includes(k.toLowerCase())));
  if (!s) return t.noAnswer;
  const askDocs = /document|papers|పత్ర|धस्तावेज|दस्तावेज|प्रमाण|धृవీకరణ|docs/.test(text);
  const askSteps = /apply|how|step|దరఖాస్తు|ఎలా|वेदन|आवेदन|कैसे|कदम|विधि/.test(text);
  const askElig = /eligib|qualify|అర్హత|पात्रता|योग्य/.test(text);
  const docs = s.docs.map((d) => "• " + d[lang]).join("\n");
  const steps = s.steps.map((d, i) => `${i + 1}. ${d[lang]}`).join("\n");
  let out = `${s.name[lang]}\n`;
  if (askDocs) out += `\n${t.docs}:\n${docs}`;
  else if (askSteps) out += `\n${t.steps}:\n${steps}`;
  else if (askElig) out += `\n${t.elig}: ${s.elig[lang]}`;
  else out += `\n${s.benefit[lang]}\n\n${t.elig}: ${s.elig[lang]}`;
  return `${out}\n\n${s.url}\n⚠ ${t.verifyNote}`;
}

function Chat({ t, lang }) {
  const [msgs, setMsgs] = useState([{ role: "bot", text: t.greet }]);
  useEffect(() => { setMsgs([{ role: "bot", text: t.greet }]); }, [lang, t.greet]);
  const [q, setQ] = useState("");
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  const send = (text) => {
    const v = (text ?? q).trim();
    if (!v) return;
    setMsgs((m) => [...m, { role: "user", text: v }, { role: "bot", text: answer(v, lang, t), demo: true }]);
    setQ("");
  };
  const quick = lang === "te" ? ["స్కాలర్‌షిప్ అర్హత ఏమిటి?", "PM-KISAN పత్రాలు ఏమిటి?", "ఆయుష్మాన్ భారత్ ఎలా దరఖాస్తు చేయాలి?"] : lang === "hi" ? ["छात्रवृत्ति की पात्रता क्या है?", "PM-KISAN के दस्तावेज़?", "आयुष्मान भारत के लिए आवेदन कैसे करें?"] : ["Scholarship eligibility?", "PM-KISAN documents?", "How to apply for Ayushman Bharat?"];
  return (
    <div className="card chat">
      <h2>🤖 {t.chatTitle}</h2>
      <p className="note">{t.chatHint}</p>
      <div className="log" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={"msg " + m.role}>
            {m.text}
            {m.demo && <small className="demo">{t.demo}</small>}
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="chips">{quick.map((x) => <button key={x} className="chip" onClick={() => send(x)}>{x}</button>)}</div>
      <div className="row">
        <input className="search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t.placeholder} />
        <button className="cta small" onClick={() => send()}>{t.send}</button>
      </div>
    </div>
  );
}

function Saved(ctx) {
  const { t, saved } = ctx;
  const list = SCHEMES.filter((s) => saved.includes(s.id));
  return (
    <>
      <h2 className="sec">★ {t.saved}</h2>
      {list.length ? <div className="grid">{list.map((s) => <SchemeCard key={s.id} s={s} {...ctx} />)}</div> : <p className="empty">{t.emptySaved}</p>}
    </>
  );
}
