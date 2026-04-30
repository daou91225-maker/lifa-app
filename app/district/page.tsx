"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function DistrictPublicPage() {
  const [categorie, setCategorie] = useState("U15")
  const [matchs, setMatchs] = useState<any[]>([])
  const [equipes, setEquipes] = useState<any[]>([])

  useEffect(() => {
    chargerDonnees()
  }, [categorie])

  const chargerDonnees = async () => {
    const { data: dataEquipes, error: errorEquipes } = await supabase
      .from("qualifies")
      .select("*")
      

    const { data: dataMatchs, error: errorMatchs } = await supabase
      .from("matchs")
      .select("*")
      

    if (errorEquipes) {
      console.log("Erreur équipes district :", errorEquipes)
    }

    if (errorMatchs) {
      console.log("Erreur matchs district :", errorMatchs)
    }

    setEquipes(dataEquipes || [])
    setMatchs(dataMatchs || [])
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>🏟️ Phase district</h1>

      <select
        value={categorie}
        onChange={(e) => setCategorie(e.target.value)}
        style={{ padding: 10, marginBottom: 20 }}
      >
        <option value="U11">U11</option>
        <option value="U13">U13</option>
        <option value="U15">U15</option>
        <option value="U17">U17</option>
      </select>

      <h2>Équipes</h2>

      {equipes.length === 0 ? (
        <p>Aucune équipe</p>
      ) : (
        equipes.map((e) => (
          <div
            key={e.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              background: "white",
            }}
          >
            <strong>{e.equipe}</strong>
            <br />
            District : {e.zone}
            <br />
            Région : {e.region}
          </div>
        ))
      )}

      <h2 style={{ marginTop: 30 }}>⚽ Matchs</h2>

      {matchs.length === 0 ? (
        <p>Aucun match</p>
      ) : (
        matchs.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              background: "white",
            }}
          >
            <strong>
              {m.equipe1} vs {m.equipe2}
            </strong>
            <br />
            Score : {m.score1} - {m.score2}
          </div>
        ))
      )}
    </main>
  )
}