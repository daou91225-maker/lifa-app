"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

type MatchPublic = {
  id: string
  equipe_a: string
  equipe_b: string
  score_a: number | null
  score_b: number | null
  categorie: string
  statut: string
}

type EquipeStats = {
  equipe: string
  points: number
  matchs: number
  victoires: number
  nuls: number
  defaites: number
  butsPour: number
  butsContre: number
  diff: number
}

export default function ClassementsPage() {
  const [categorie, setCategorie] = useState("Toutes")
  const [classement, setClassement] = useState<EquipeStats[]>([])

  useEffect(() => {
    chargerClassement()
  }, [categorie])

  async function chargerClassement() {
    const { data, error } = await supabase
      .from("matchs_publics")
      .select("*")
      .order("id", { ascending: true })

    if (error) {
      alert("Erreur chargement classement : " + error.message)
      return
    }

    const matchsFiltres =
      categorie === "Toutes"
        ? data || []
        : (data || []).filter((m: MatchPublic) => m.categorie === categorie)

    const stats: Record<string, EquipeStats> = {}

    matchsFiltres.forEach((m: MatchPublic) => {
      const equipeA = m.equipe_a
      const equipeB = m.equipe_b
      const scoreA = m.score_a ?? 0
      const scoreB = m.score_b ?? 0

      if (!equipeA || !equipeB) return

      if (!stats[equipeA]) {
        stats[equipeA] = {
          equipe: equipeA,
          points: 0,
          matchs: 0,
          victoires: 0,
          nuls: 0,
          defaites: 0,
          butsPour: 0,
          butsContre: 0,
          diff: 0,
        }
      }

      if (!stats[equipeB]) {
        stats[equipeB] = {
          equipe: equipeB,
          points: 0,
          matchs: 0,
          victoires: 0,
          nuls: 0,
          defaites: 0,
          butsPour: 0,
          butsContre: 0,
          diff: 0,
        }
      }

      stats[equipeA].matchs += 1
      stats[equipeB].matchs += 1

      stats[equipeA].butsPour += scoreA
      stats[equipeA].butsContre += scoreB

      stats[equipeB].butsPour += scoreB
      stats[equipeB].butsContre += scoreA

      if (scoreA > scoreB) {
        stats[equipeA].points += 3
        stats[equipeA].victoires += 1
        stats[equipeB].defaites += 1
      } else if (scoreB > scoreA) {
        stats[equipeB].points += 3
        stats[equipeB].victoires += 1
        stats[equipeA].defaites += 1
      } else {
        stats[equipeA].points += 1
        stats[equipeB].points += 1
        stats[equipeA].nuls += 1
        stats[equipeB].nuls += 1
      }
    })

    const classementFinal = Object.values(stats)
      .map((equipe) => ({
        ...equipe,
        diff: equipe.butsPour - equipe.butsContre,
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.diff - a.diff ||
          b.butsPour - a.butsPour ||
          a.equipe.localeCompare(b.equipe)
      )

    setClassement(classementFinal)
  }

  return (
    <main style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h1>📊 Classements</h1>
      <p>Classement automatique généré à partir des matchs enregistrés.</p>

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

      {classement.length === 0 ? (
        <p>Aucun classement disponible pour le moment.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
            }}
          >
            <thead>
              <tr style={{ background: "#111827", color: "white" }}>
                <th style={{ padding: 10 }}>#</th>
                <th style={{ padding: 10, textAlign: "left" }}>Équipe</th>
                <th style={{ padding: 10 }}>Pts</th>
                <th style={{ padding: 10 }}>MJ</th>
                <th style={{ padding: 10 }}>V</th>
                <th style={{ padding: 10 }}>N</th>
                <th style={{ padding: 10 }}>D</th>
                <th style={{ padding: 10 }}>BP</th>
                <th style={{ padding: 10 }}>BC</th>
                <th style={{ padding: 10 }}>Diff</th>
              </tr>
            </thead>

            <tbody>
              {classement.map((equipe, index) => (
                <tr key={equipe.equipe} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: 10, textAlign: "center" }}>{index + 1}</td>
                  <td style={{ padding: 10, fontWeight: 700 }}>{equipe.equipe}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.points}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.matchs}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.victoires}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.nuls}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.defaites}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.butsPour}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.butsContre}</td>
                  <td style={{ padding: 10, textAlign: "center" }}>{equipe.diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}