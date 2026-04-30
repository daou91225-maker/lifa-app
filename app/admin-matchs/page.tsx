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
  score_a?: number | null
  score_b?: number | null
}

export default function AdminMatchsPage() {
  const [matchs, setMatchs] = useState<MatchPublic[]>([])
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes")

  const [equipe1, setEquipe1] = useState("")
  const [equipe2, setEquipe2] = useState("")
  const [categorie, setCategorie] = useState("U15")
  const [dateMatch, setDateMatch] = useState("")
  const [heure, setHeure] = useState("")
  const [lieu, setLieu] = useState("Terrain à définir")
  const [statut, setStatut] = useState("Programmé")

  useEffect(() => {
    chargerMatchs()
  }, [])

  async function chargerMatchs() {
    const { data, error } = await supabase
      .from("matchs_publics")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      alert("Erreur chargement : " + error.message)
      return
    }

    setMatchs(data || [])
  }

  async function ajouterMatch() {
    if (!equipe1 || !equipe2 || !dateMatch || !heure) {
      alert("Remplis équipe 1, équipe 2, date et heure.")
      return
    }

    const { error } = await supabase.from("matchs_publics").insert([
      {
        equipe_a: equipe1,
        equipe_b: equipe2,
        date_match: dateMatch,
        heure,
        categorie,
        lieu,
        statut,
      },
    ])

    if (error) {
      alert("Erreur ajout : " + error.message)
      return
    }

    alert("Match ajouté 🔥")
    setEquipe1("")
    setEquipe2("")
    setDateMatch("")
    setHeure("")
    setLieu("Terrain à définir")
    setStatut("Programmé")
    chargerMatchs()
  }

 async function modifierMatch(match: MatchPublic) {
console.log("MATCH ENVOYÉ :", match)
  const scoreA = Number(match.score_a)
  const scoreB = Number(match.score_b)

  const { error } = await supabase
    .from("matchs_publics")
    .update({
      equipe_a: match.equipe_a,
      equipe_b: match.equipe_b,
      date_match: match.date_match,
      heure: match.heure,
      categorie: match.categorie,
      lieu: match.lieu,
      statut: match.statut,
      score_a: scoreA,
      score_b: scoreB,
    })
    .eq("id", match.id)

  if (error) {
    alert("Erreur modification : " + error.message)
    return
  }

  setMatchs((anciens) =>
    anciens.map((m) =>
      m.id === match.id
        ? { ...m, score_a: scoreA, score_b: scoreB }
        : m
    )
  )

  alert("Match modifié ✅")

    chargerMatchs()
  }

  async function supprimerMatch(id: string) {
    const confirmation = confirm("Supprimer ce match ?")
    if (!confirmation) return

    const { error } = await supabase
      .from("matchs_publics")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erreur suppression : " + error.message)
      return
    }

    alert("Match supprimé 🗑️")
    chargerMatchs()
  }

function updateLocalMatch(id: string, field: keyof MatchPublic, value: any) {
  setMatchs((anciens) =>
    anciens.map((m) =>
      m.id === id
        ? {
            ...m,
            [field]:
              field === "score_a" || field === "score_b"
                ? Number(value)
                : value,
          }
        : m
    )
  )
}

  const matchsFiltres =
    filtreCategorie === "Toutes"
      ? matchs
      : matchs.filter((m) => m.categorie === filtreCategorie)

  return (
    <main style={{ padding: 20 }}>
      <h1>⚙️ Admin Matchs</h1>

      <section
        style={{
          background: "white",
          padding: 18,
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          marginBottom: 24,
          maxWidth: 600,
        }}
      >
        <h2>Ajouter un match</h2>

        <div style={{ display: "grid", gap: 12 }}>
          <input placeholder="Équipe 1" value={equipe1} onChange={(e) => setEquipe1(e.target.value)} />
          <input placeholder="Équipe 2" value={equipe2} onChange={(e) => setEquipe2(e.target.value)} />

          <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            <option value="U11">U11</option>
            <option value="U13">U13</option>
            <option value="U15">U15</option>
            <option value="U17">U17</option>
          </select>

          <input type="date" value={dateMatch} onChange={(e) => setDateMatch(e.target.value)} />
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} />
          <input placeholder="Lieu" value={lieu} onChange={(e) => setLieu(e.target.value)} />

          <select value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="Programmé">Programmé</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Reporté">Reporté</option>
            <option value="Annulé">Annulé</option>
          </select>

          <button onClick={ajouterMatch}>Ajouter match</button>
        </div>
      </section>

      <section>
        <h2>Liste des matchs</h2>

        <select
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
          style={{ marginBottom: 18 }}
        >
          <option value="Toutes">Toutes les catégories</option>
          <option value="U11">U11</option>
          <option value="U13">U13</option>
          <option value="U15">U15</option>
          <option value="U17">U17</option>
        </select>

        <div style={{ display: "grid", gap: 14 }}>
          {matchsFiltres.map((match) => (
            <div
              key={match.id}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <input
                value={match.equipe_a}
                onChange={(e) => updateLocalMatch(match.id, "equipe_a", e.target.value)}
              />

              <span style={{ margin: "0 8px" }}>vs</span>

              <input
                value={match.equipe_b}
                onChange={(e) => updateLocalMatch(match.id, "equipe_b", e.target.value)}
              />

              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <input
                  type="date"
                  value={match.date_match}
                  onChange={(e) => updateLocalMatch(match.id, "date_match", e.target.value)}
                />

                <input
                  type="time"
                  value={match.heure}
                  onChange={(e) => updateLocalMatch(match.id, "heure", e.target.value)}
                />

                <select
                  value={match.categorie}
                  onChange={(e) => updateLocalMatch(match.id, "categorie", e.target.value)}
                >
                  <option value="U11">U11</option>
                  <option value="U13">U13</option>
                  <option value="U15">U15</option>
                  <option value="U17">U17</option>
                </select>

                <input
                  value={match.lieu || ""}
                  onChange={(e) => updateLocalMatch(match.id, "lieu", e.target.value)}
                />

                <select
                  value={match.statut || "Programmé"}
                  onChange={(e) => updateLocalMatch(match.id, "statut", e.target.value)}
                >
                  <option value="Programmé">Programmé</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Reporté">Reporté</option>
                  <option value="Annulé">Annulé</option>
                </select>

                <div>
                  Score :
                  <input
                    type="number"
                    value={match.score_a ?? 0}
                    onChange={(e) =>
                      updateLocalMatch(match.id, "score_a", Number(e.target.value))
                    }
                    style={{ width: 60, marginLeft: 8 }}
                  />
                  <span style={{ margin: "0 8px" }}>-</span>
                  <input
                    type="number"
                    value={match.score_b ?? 0}
                    onChange={(e) =>
                      updateLocalMatch(match.id, "score_b", Number(e.target.value))
                    }
                    style={{ width: 60 }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => modifierMatch(match)}>
                    Modifier
                  </button>

                  <button
                    onClick={() => supprimerMatch(match.id)}
                    style={{ background: "#dc2626", color: "white" }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}