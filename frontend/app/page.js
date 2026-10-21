"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const StatsPanel = dynamic(() => import("../components/StatsPanel"), {
  loading: () => <p className="muted">Loading stats...</p>,
});

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const ROLES = ["Batter", "Bowler", "All-rounder", "Wicket-keeper"];
const emptyForm = { name: "", role: "Batter", nationality: "India", jerseyNumber: "", note: "" };

async function api(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [fan, setFan] = useState({ fanName: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPlayers = useCallback(async () => {
    const q = new URLSearchParams();
    if (roleFilter) q.set("role", roleFilter);
    if (search) q.set("search", search);
    setPlayers(await api(`/api/players?${q.toString()}`));
  }, [roleFilter, search]);

  const loadPosts = useCallback(async () => setPosts(await api("/api/posts")), []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPlayers(), loadPosts()])
      .then(() => setError(""))
      .catch(() =>
        setError("Cannot reach the backend. On Render's free plan it may be waking up - wait 30-60 seconds and refresh.")
      )
      .finally(() => setLoading(false));
  }, [loadPlayers, loadPosts]);

  const run = async (fn) => {
    try {
      setError("");
      await fn();
    } catch (e) {
      setError(e.message);
    }
  };

  const savePlayer = (e) => {
    e.preventDefault();
    run(async () => {
      const body = JSON.stringify({
        ...form,
        jerseyNumber: form.jerseyNumber === "" ? undefined : Number(form.jerseyNumber),
      });
      if (editId) await api(`/api/players/${editId}`, { method: "PUT", body });
      else await api("/api/players", { method: "POST", body });
      setForm(emptyForm);
      setEditId(null);
      await loadPlayers();
    });
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name,
      role: p.role,
      nationality: p.nationality || "",
      jerseyNumber: p.jerseyNumber ?? "",
      note: p.note || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removePlayer = (id) =>
    run(async () => {
      await api(`/api/players/${id}`, { method: "DELETE" });
      await loadPlayers();
    });

  const addPost = (e) => {
    e.preventDefault();
    run(async () => {
      await api("/api/posts", { method: "POST", body: JSON.stringify(fan) });
      setFan({ fanName: "", message: "" });
      await loadPosts();
    });
  };

  const like = (id) =>
    run(async () => {
      await api(`/api/posts/${id}/like`, { method: "PATCH" });
      await loadPosts();
    });

  return (
    <main className="page">
      <header className="hero">
        <div className="badge">RCB</div>
        <div>
          <h1>RCB Fan Hub</h1>
          <p>Royal Challengers Bengaluru - squad manager &amp; fan wall</p>
          <p className="tag">Ee Sala Cup Namde!</p>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <section className="card">
        <h2>Squad Overview</h2>
        <StatsPanel players={players} />
      </section>

      <section className="card">
        <h2>{editId ? "Edit Player" : "Add Player"}</h2>
        <form className="grid" onSubmit={savePlayer}>
          <input placeholder="Player name" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <input placeholder="Nationality" value={form.nationality}
            onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
          <input type="number" min="0" placeholder="Jersey no." value={form.jerseyNumber}
            onChange={(e) => setForm({ ...form, jerseyNumber: e.target.value })} />
          <input className="wide" placeholder="Note (optional)" value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <div className="wide row">
            <button type="submit">{editId ? "Update Player" : "Add Player"}</button>
            {editId && (
              <button type="button" className="ghost"
                onClick={() => { setEditId(null); setForm(emptyForm); }}>Cancel</button>
            )}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="row spread">
          <h2>Players ({players.length})</h2>
          <div className="row">
            <input placeholder="Search name..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        {loading && <p className="muted">Loading...</p>}
        {!loading && players.length === 0 && <p className="muted">No players found.</p>}
        <ul className="list">
          {players.map((p) => (
            <li key={p._id} className="player">
              <div className="jersey">{p.jerseyNumber ?? "-"}</div>
              <div className="info">
                <b>{p.name}</b>
                <span>{p.role} | {p.nationality}{p.note ? ` | ${p.note}` : ""}</span>
              </div>
              <div className="row">
                <button className="ghost" onClick={() => startEdit(p)}>Edit</button>
                <button className="danger" onClick={() => removePlayer(p._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Fan Wall</h2>
        <form className="grid" onSubmit={addPost}>
          <input placeholder="Your name" required maxLength={40} value={fan.fanName}
            onChange={(e) => setFan({ ...fan, fanName: e.target.value })} />
          <input className="wide" placeholder="Cheer for RCB..." required maxLength={280} value={fan.message}
            onChange={(e) => setFan({ ...fan, message: e.target.value })} />
          <div className="wide"><button type="submit">Post</button></div>
        </form>
        <ul className="list">
          {posts.map((p) => (
            <li key={p._id} className="post">
              <div className="info">
                <b>{p.fanName}</b>
                <span>{p.message}</span>
              </div>
              <button className="ghost" onClick={() => like(p._id)}>&#9829; {p.likes}</button>
            </li>
          ))}
          {posts.length === 0 && <p className="muted">Be the first to cheer!</p>}
        </ul>
      </section>

      <footer className="foot">AWT Practical 13 - Next.js + Express + MongoDB Atlas</footer>
    </main>
  );
}
