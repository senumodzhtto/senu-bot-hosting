"use client";
import { useState } from "react";

export default function CreatePage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("whatsapp");
  const [telegramToken, setTelegramToken] = useState("");
  const [msg, setMsg] = useState("");

  async function create() {
    setMsg("Deploying...");
    const token = localStorage.getItem("token");

    const r = await fetch("/api/bots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, type, telegramToken })
    });

    const j = await r.json();
    setMsg(r.ok ? "Bot deployed 🚀" : j.error);
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Create Bot</h2>

      <input
        placeholder="Bot name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        style={{ width:"100%", padding:10, margin:"8px 0" }}
      />

      <select
        value={type}
        onChange={(e)=>setType(e.target.value)}
        style={{ width:"100%", padding:10, margin:"8px 0" }}
      >
        <option value="whatsapp">WhatsApp</option>
        <option value="telegram">Telegram</option>
      </select>

      {type === "telegram" && (
        <input
          placeholder="Telegram Bot Token"
          value={telegramToken}
          onChange={(e)=>setTelegramToken(e.target.value)}
          style={{ width:"100%", padding:10, margin:"8px 0" }}
        />
      )}

      <button onClick={create} style={{ width:"100%", padding:10 }}>
        Create Bot
      </button>

      <p>{msg}</p>
    </main>
  );
}
