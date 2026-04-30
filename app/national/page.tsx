"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

type Qualifie = {
  id?: number
  categorie?: string
  niveau?: string
  equipe?: string
  nom?: string
  district?: string
  region?: string
  statut?: string
}

type MatchNational = {
  id?: number
  categorie?: string
  phase?: string
  poule?: string
  equipe1?: string
  equipe2?: string
  score1?: number | null
  score2?: number | null
  tab1?: number | null
  tab2?: number | null
}

type LigneClassement = {
  equipe: string
  pts: number
  mj: number
  bp: number
  bc: number
  diff: number
}

export default function NationalPage() {
  const [categorie, setCategorie] = useState("U15")
  const [qualifies, setQualifies] = useState<Qualifie[]>([])
  const [matchs, setMatchs] = useState<MatchNational[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    chargerDonnees()
  }, [categorie])

  async function chargerDonnees() {
    setLoading(true)
    setError("")

    try {
      const { data: qualifiesData, error: errQualifies } = await supabase
        .from("qualifies")
        .select("*")
        .eq("categorie", categorie)

      if (errQualifies) throw errQualifies

      const { data: nationalData, error: errNational } = await supabase
        .from("national_competition")
        .select("*")
        .eq("categorie", categorie)
        .order("id", { ascending: true })

      if (errNational) throw errNational

      setQualifies((qualifiesData || []) as Qualifie[])
      setMatchs((nationalData || []) as MatchNational[])
    } catch (e) {
      console.error(e)
      setError("Erreur de chargement de la phase nationale.")
      setQualifies([])
      setMatchs([])
    } finally {
      setLoading(false)
    }
  }

  const equipesNationales = useMemo(() => {
    return qualifies.filter((q) => {
      const niveau = (q.niveau || "").toLowerCase()
      return !niveau || niveau === "national"
    })
  }, [qualifies])

  const matchsPoules = useMemo(() => {
    return matchs.filter((m) => {
      const phase = (m.phase || "").toLowerCase()
      return phase === "" || phase === "poule" || phase === "poules"
    })
  }, [matchs])

  const demiFinales = useMemo(() => {
    return matchs.filter((m) => {
      const phase = (m.phase || "").toLowerCase()
      return phase === "demi" || phase === "demi-finale" || phase === "demi_finale"
    })
  }, [matchs])

  const finale = useMemo(() => {
    return (
      matchs.find((m) => {
        const phase = (m.phase || "").toLowerCase()
        return phase === "finale"
      }) || null
    )
  }, [matchs])

  const poules = useMemo(() => {
    return Array.from(
      new Set(
        matchsPoules
          .map((m) => m.poule)
          .filter((p): p is string => !!p && p.trim() !== "")
      )
    )
  }, [matchsPoules])

  function afficherNomEquipe(q: Qualifie) {
    return q.equipe || q.nom || "-"
  }

  function afficherStatutPublic(statut?: string) {
    if (!statut) return ""
    if (statut === "champion_poule") return "Champion de zone"
    if (statut === "qualification_directe") return "Qualification directe"
    if (statut === "champion_district") return "Champion de district"
    if (statut === "champion_region") return "Champion régional"
    return statut
  }

  function afficherScore(match: MatchNational) {
    const s1 = match.score1 ?? 0
    const s2 = match.score2 ?? 0

    if (
      s1 === s2 &&
      match.tab1 !== null &&
      match.tab1 !== undefined &&
      match.tab2 !== null &&
      match.tab2 !== undefined
    ) {
      return `${s1} - ${s2} (TAB ${match.tab1} - ${match.tab2})`
    }

    return `${s1} - ${s2}`
  }

  function calculerVainqueur(match: MatchNational | null) {
    if (!match) return null

    const s1 = match.score1 ?? 0
    const s2 = match.score2 ?? 0

    if (s1 > s2) return match.equipe1 || null
    if (s2 > s1) return match.equipe2 || null

    if (
      match.tab1 !== null &&
      match.tab1 !== undefined &&
      match.tab2 !== null &&
      match.tab2 !== undefined
    ) {
      if (match.tab1 > match.tab2) return match.equipe1 || null
      if (match.tab2 > match.tab1) return match.equipe2 || null
    }

    return null
  }

  function calculerClassementPoule(lettre: string): LigneClassement[] {
    const matchsDeLaPoule = matchsPoules.filter((m) => m.poule === lettre)

    const table: Record<string, LigneClassement> = {}

    matchsDeLaPoule.forEach((m) => {
      const equipe1 = m.equipe1 || ""
      const equipe2 = m.equipe2 || ""
      const score1 = m.score1 ?? 0
      const score2 = m.score2 ?? 0

      if (!table[equipe1]) {
        table[equipe1] = {
          equipe: equipe1,
          pts: 0,
          mj: 0,
          bp: 0,
          bc: 0,
          diff: 0,
        }
      }

      if (!table[equipe2]) {
        table[equipe2] = {
          equipe: equipe2,
          pts: 0,
          mj: 0,
          bp: 0,
          bc: 0,
          diff: 0,
        }
      }

      table[equipe1].mj += 1
      table[equipe2].mj += 1

      table[equipe1].bp += score1
      table[equipe1].bc += score2

      table[equipe2].bp += score2
      table[equipe2].bc += score1

      if (score1 > score2) {
        table[equipe1].pts += 3
      } else if (score2 > score1) {
        table[equipe2].pts += 3
      } else {
        table[equipe1].pts += 1
        table[equipe2].pts += 1
      }
    })

    const classement = Object.values(table).map((ligne) => ({
      ...ligne,
      diff: ligne.bp - ligne.bc,
    }))

    classement.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.diff !== a.diff) return b.diff - a.diff
      if (b.bp !== a.bp) return b.bp - a.bp
      return a.equipe.localeCompare(b.equipe)
    })

    return classement
  }

  const champion = calculerVainqueur(finale)

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(90deg, #f97316, #22c55e)",
          color: "white",
          padding: 24,
          borderRadius: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.9 }}>Plateforme officielle LIFA</div>
        <h1 style={{ margin: "8px 0", fontSize: 42 }}>CI Phase Nationale</h1>
        <div style={{ fontSize: 18 }}>
          Consultation publique des équipes qualifiées, poules, matchs, classements et champion national.
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 14 }}>Catégorie</div>
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            style={{
              marginTop: 10,
              padding: 8,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              width: "100%",
            }}
          >
            <option value="U11">U11</option>
            <option value="U13">U13</option>
            <option value="U15">U15</option>
            <option value="U17">U17</option>
          </select>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 14 }}>Équipes qualifiées</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {equipesNationales.length}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 14 }}>Poules</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {poules.length}
          </div>
        </div>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 14 }}>Matchs de poules</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {matchsPoules.length}
          </div>
        </div>

        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 14 }}>Champion national</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 10 }}>
            {champion || "-"}
          </div>
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p style={{ color: "#b91c1c" }}>{error}</p>
      ) : (
        <>
          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Équipes qualifiées</h2>

            {equipesNationales.length === 0 ? (
              <p>Aucune équipe qualifiée publiée pour cette catégorie.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {equipesNationales.map((team, index) => (
                  <div
                    key={team.id || index}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: 14,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 22 }}>
                      {afficherNomEquipe(team)}
                    </div>

                    <div style={{ color: "#6b7280", marginTop: 8 }}>
                      {team.district || "-"}
                    </div>

                    <div style={{ color: "#9ca3af", marginTop: 4 }}>
                      {team.region || "-"}
                    </div>

                    <div style={{ color: "#2563eb", marginTop: 8, fontSize: 14 }}>
                      {afficherStatutPublic(team.statut)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Poules, matchs et classements</h2>

            {matchsPoules.length === 0 ? (
              <p>Aucun match de poule publié.</p>
            ) : (
              poules.map((poule) => {
                const classement = calculerClassementPoule(poule)

                return (
                  <div key={poule} style={{ marginBottom: 28 }}>
                    <h3 style={{ marginBottom: 12 }}>Poule {poule}</h3>

                    <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                      {matchsPoules
                        .filter((m) => m.poule === poule)
                        .map((match, index) => (
                          <div
                            key={match.id || index}
                            style={{
                              border: "1px solid #e5e7eb",
                              borderRadius: 12,
                              padding: 12,
                              background: "#f9fafb",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <div>
                              {match.equipe1} vs {match.equipe2}
                            </div>
                            <div style={{ fontWeight: 700 }}>{afficherScore(match)}</div>
                          </div>
                        ))}
                    </div>

                    <div
                      style={{
                        overflowX: "auto",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f3f4f6" }}>
                            <th style={{ textAlign: "left", padding: 10 }}>#</th>
                            <th style={{ textAlign: "left", padding: 10 }}>Équipe</th>
                            <th style={{ textAlign: "center", padding: 10 }}>Pts</th>
                            <th style={{ textAlign: "center", padding: 10 }}>MJ</th>
                            <th style={{ textAlign: "center", padding: 10 }}>BP</th>
                            <th style={{ textAlign: "center", padding: 10 }}>BC</th>
                            <th style={{ textAlign: "center", padding: 10 }}>Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classement.map((ligne, index) => (
                            <tr
                              key={ligne.equipe}
                              style={{
                                borderTop: "1px solid #e5e7eb",
                                background: index === 0 ? "#ecfdf5" : "white",
                              }}
                            >
                              <td style={{ padding: 10 }}>{index + 1}</td>
                              <td style={{ padding: 10, fontWeight: 700 }}>{ligne.equipe}</td>
                              <td style={{ padding: 10, textAlign: "center" }}>{ligne.pts}</td>
                              <td style={{ padding: 10, textAlign: "center" }}>{ligne.mj}</td>
                              <td style={{ padding: 10, textAlign: "center" }}>{ligne.bp}</td>
                              <td style={{ padding: 10, textAlign: "center" }}>{ligne.bc}</td>
                              <td style={{ padding: 10, textAlign: "center" }}>{ligne.diff}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })
            )}
          </section>

          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Demi-finales</h2>

            {demiFinales.length === 0 ? (
              <p>Aucune demi-finale publiée.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {demiFinales.map((match, index) => (
                  <div
                    key={match.id || index}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: 12,
                      background: "#f9fafb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div>
                      {match.equipe1} vs {match.equipe2}
                    </div>
                    <div style={{ fontWeight: 700 }}>{afficherScore(match)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Finale</h2>

            {!finale ? (
              <p>Aucune finale publiée.</p>
            ) : (
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  background: "#f9fafb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div>
                  {finale.equipe1} vs {finale.equipe2}
                </div>
                <div style={{ fontWeight: 700 }}>{afficherScore(finale)}</div>
              </div>
            )}
          </section>

          <section
            style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: 18,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#6b7280", marginBottom: 8 }}>Champion officiel</div>
            <div style={{ fontSize: 40, fontWeight: 900 }}>
              🏆 {champion || "-"}
            </div>
          </section>
        </>
      )}
    </main>
  )
}