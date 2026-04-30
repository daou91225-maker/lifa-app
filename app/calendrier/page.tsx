"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

type MatchPublic = {
  id: string
  equipe_a: string
  equipe_b: string
  date_match: string
  heure: string
  categorie: string
  lieu: string
  statut: string
}

export default function CalendrierPage() {
  const [matchs, setMatchs] = useState<MatchPublic[]>([])
  const [categorie, setCategorie] = useState("Toutes")

  useEffect(() => {
    chargerMatchs()
  }, [])

  async function chargerMatchs() {
    const { data, error } = await supabase
      .from("matchs_publics")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error(error)
      return
    }

    setMatchs(data || [])
  }

  const matchsFiltres =
    categorie === "Toutes"
      ? matchs
      : matchs.filter((m) => m.categorie === categorie)

  return (
    <main style={{ padding: 20 }}>
      <h1>📅 Calendrier des matchs</h1>
      <p>Consultation publique des matchs programmés par la LIFA.</p>

      <select
        value={categorie}
        onChange={(e) => setCategorie(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      >
        <option value="Toutes">Toutes les catégories</option>
        <option value="U11">U11</option>
        <option value="U13">U13</option>
        <option value="U15">U15</option>
        <option value="U17">U17</option>
      </select>

      {matchsFiltres.length === 0 ? (
        <p>Aucun match programmé pour le moment.</p>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {matchsFiltres.map((match) => (
            <div
              key={match.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                {match.equipe_a} vs {match.equipe_b}
              </h2>

              <div>📅 {match.date_match} — 🕘 {match.heure}</div>
              <div>🏷️ Catégorie : {match.categorie}</div>
              <div>📍 Lieu : {match.lieu || "Terrain à définir"}</div>
              <div>✅ Statut : {match.statut || "Programmé"}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}