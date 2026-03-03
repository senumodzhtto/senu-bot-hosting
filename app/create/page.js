"use client";
import { useState } from "react";

export default function CreatePage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("whatsapp");
  const [msg, setMsg] = useState("");

  async function create() {
    const token = localStorage.getItem("token");

    const r = await fetch("/api/bots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ name, type })
    });

    const j = await r.json();
    setMsg(r.ok ? "Bot deployed 🚀" : j.error);
  }

  return (
    <main style={{ padding: 40 }}>
      <h2>Create Bot</h2>

      <input
        placeholder="Bot name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
      />

      <button onClick={create}>Create</button>

      <p>{msg}</p>
    </main>
  );
}
