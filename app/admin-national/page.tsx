"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

type Equipe = {
  id?: string | number
  nom?: string
  categorie?: string
  district?: string
  region?: string
  zone?: string
}

type Qualifie = {
  id?: number
  categorie?: string
  equipe?: string
  nom?: string
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

const buttonBaseStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "10px 16px",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  background: "linear-gradient(90deg, #ea580c, #16a34a)",
  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
}

const buttonSecondaryStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: "linear-gradient(90deg, #0f172a, #1d4ed8)",
}

const buttonDangerStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  background: "linear-gradient(90deg, #991b1b, #dc2626)",
}

export default function AdminNationalPage() {
  const [categorie, setCategorie] = useState("U15")
  const [equipesRef, setEquipesRef] = useState<Equipe[]>([])
  const [qualifies, setQualifies] = useState<Qualifie[]>([])
  const [matchs, setMatchs] = useState<MatchNational[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    charger()
  }, [categorie])

  async function charger() {
    setLoading(true)

    try {
      const { data: equipesData, error: errEquipes } = await supabase
        .from("equipes")
        .select("*")
        .eq("categorie", categorie)

      if (errEquipes) throw errEquipes

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

      setEquipesRef((equipesData || []) as Equipe[])
      setQualifies((qualifiesData || []) as Qualifie[])
      setMatchs((nationalData || []) as MatchNational[])
    } catch (error) {
      console.error("Erreur chargement admin national :", error)
      alert("Erreur chargement phase nationale")
      setEquipesRef([])
      setQualifies([])
      setMatchs([])
    } finally {
      setLoading(false)
    }
  }

  function normaliserNom(value?: string) {
    return (value || "").trim().toLowerCase()
  }

  function nomEquipe(q: Qualifie) {
    return q.equipe || q.nom || "-"
  }

  function infosEquipeDepuisReference(nom: string) {
    return (
      equipesRef.find((e) => normaliserNom(e.nom) === normaliserNom(nom)) || null
    )
  }

  function districtEquipe(q: Qualifie) {
    const ref = infosEquipeDepuisReference(nomEquipe(q))
    return ref?.district || "-"
  }

  function regionEquipe(q: Qualifie) {
    const ref = infosEquipeDepuisReference(nomEquipe(q))
    return ref?.region || "-"
  }

  function zoneEquipe(q: Qualifie) {
    const ref = infosEquipeDepuisReference(nomEquipe(q))
    return ref?.zone || "-"
  }

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

  function parseNum(value: string) {
    if (value === "") return null
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }

  function setMatchField(
    matchId: number | undefined,
    field: keyof MatchNational,
    value: number | null
  ) {
    if (!matchId) return

    setMatchs((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, [field]: value } : m))
    )
  }

  function shuffleArray<T>(array: T[]) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
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

  async function actualiserQualifies() {
    try {
      const { data: equipesData, error } = await supabase
        .from("equipes")
        .select("nom,categorie")
        .eq("categorie", categorie)

      if (error) throw error

      const equipes = (equipesData || []) as Equipe[]

      if (equipes.length === 0) {
        alert("Aucune équipe trouvée pour cette catégorie")
        return
      }

      const qualifiesAInserer = equipes.map((equipe) => ({
        equipe: equipe.nom || "",
        nom: equipe.nom || "",
        categorie: equipe.categorie || categorie,
        statut: "qualification_directe",
      }))

      const { error: deleteError } = await supabase
        .from("qualifies")
        .delete()
        .eq("categorie", categorie)

      if (deleteError) throw deleteError

      const { error: insertError } = await supabase
        .from("qualifies")
        .insert(qualifiesAInserer)

      if (insertError) throw insertError

      await charger()
      alert("Qualifiés actualisés")
    } catch (error: any) {
      console.error("Erreur actualisation qualifiés :", error)
      const message =
        error?.message ||
        error?.details ||
        error?.hint ||
        JSON.stringify(error)
      alert("Erreur actualisation des qualifiés : " + message)
    }
  }

  async function genererPoulesNationales() {
    if (qualifies.length < 4) {
      alert("Pas assez d'équipes qualifiées")
      return
    }

    const equipes = shuffleArray(qualifies.map((q) => nomEquipe(q)))

    const { error: deleteError } = await supabase
      .from("national_competition")
      .delete()
      .eq("categorie", categorie)

    if (deleteError) {
      console.error(deleteError)
      alert("Erreur suppression ancienne phase nationale")
      return
    }

    let repartition: Record<string, string[]> = {}

    if (equipes.length <= 4) {
      repartition = { A: equipes }
    } else if (equipes.length <= 8) {
      repartition = { A: [], B: [] }
      equipes.forEach((equipe, index) => {
        if (index % 2 === 0) repartition.A.push(equipe)
        else repartition.B.push(equipe)
      })
    } else if (equipes.length <= 12) {
      repartition = { A: [], B: [], C: [] }
      equipes.forEach((equipe, index) => {
        const lettre = ["A", "B", "C"][index % 3]
        repartition[lettre].push(equipe)
      })
    } else {
      repartition = { A: [], B: [], C: [], D: [] }
      equipes.forEach((equipe, index) => {
        const lettre = ["A", "B", "C", "D"][index % 4]
        repartition[lettre].push(equipe)
      })
    }

    const nouveauxMatchs: Omit<MatchNational, "id">[] = []

    Object.entries(repartition).forEach(([poule, equipesPoule]) => {
      for (let i = 0; i < equipesPoule.length; i++) {
        for (let j = i + 1; j < equipesPoule.length; j++) {
          nouveauxMatchs.push({
            categorie,
            phase: "poule",
            poule,
            equipe1: equipesPoule[i],
            equipe2: equipesPoule[j],
            score1: 0,
            score2: 0,
            tab1: null,
            tab2: null,
          })
        }
      }
    })

    if (nouveauxMatchs.length === 0) {
      alert("Aucun match à générer")
      return
    }

    const { error } = await supabase
      .from("national_competition")
      .insert(nouveauxMatchs)

    if (error) {
      console.error(error)
      alert("Erreur génération poules nationales")
      return
    }

    await charger()
    alert("Poules nationales générées")
  }

  async function genererMatchs() {
    if (matchsPoules.length > 0) {
      alert("Les matchs existent déjà")
      return
    }

    await genererPoulesNationales()
  }

  function gagnantMatch(match: MatchNational) {
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

  async function genererDemiFinales() {
    if (poules.length < 1) {
      alert("Tu dois d'abord générer les poules")
      return
    }

    if (demiFinales.length > 0) {
      alert("Les demi-finales existent déjà")
      return
    }

    const premiers: string[] = []
    const deuxiemes: string[] = []

    poules.forEach((lettre) => {
      const classement = calculerClassementPoule(lettre)
      if (classement[0]) premiers.push(classement[0].equipe)
      if (classement[1]) deuxiemes.push(classement[1].equipe)
    })

    let matchsDemi: Omit<MatchNational, "id">[] = []

    if (premiers.length >= 2 && deuxiemes.length >= 2) {
      matchsDemi = [
        {
          categorie,
          phase: "demi-finale",
          poule: "",
          equipe1: premiers[0],
          equipe2: deuxiemes[1] || premiers[1],
          score1: 0,
          score2: 0,
          tab1: null,
          tab2: null,
        },
        {
          categorie,
          phase: "demi-finale",
          poule: "",
          equipe1: premiers[1] || deuxiemes[0],
          equipe2: deuxiemes[0],
          score1: 0,
          score2: 0,
          tab1: null,
          tab2: null,
        },
      ]
    } else {
      const toutes = Array.from(
        new Set(
          matchsPoules.flatMap((m) => [m.equipe1 || "", m.equipe2 || ""]).filter(Boolean)
        )
      )

      if (toutes.length < 4) {
        alert("Pas assez d'équipes pour les demi-finales")
        return
      }

      matchsDemi = [
        {
          categorie,
          phase: "demi-finale",
          poule: "",
          equipe1: toutes[0],
          equipe2: toutes[1],
          score1: 0,
          score2: 0,
          tab1: null,
          tab2: null,
        },
        {
          categorie,
          phase: "demi-finale",
          poule: "",
          equipe1: toutes[2],
          equipe2: toutes[3],
          score1: 0,
          score2: 0,
          tab1: null,
          tab2: null,
        },
      ]
    }

    const { error } = await supabase
      .from("national_competition")
      .insert(matchsDemi)

    if (error) {
      console.error(error)
      alert("Erreur génération demi-finales")
      return
    }

    await charger()
    alert("Demi-finales générées")
  }

  async function genererFinale() {
    if (demiFinales.length < 2) {
      alert("Tu dois d'abord générer les demi-finales")
      return
    }

    if (finale) {
      alert("La finale existe déjà")
      return
    }

    const g1 = gagnantMatch(demiFinales[0])
    const g2 = gagnantMatch(demiFinales[1])

    if (!g1 || !g2) {
      alert("Il faut d'abord départager les demi-finales")
      return
    }

    const { error } = await supabase.from("national_competition").insert([
      {
        categorie,
        phase: "finale",
        poule: "",
        equipe1: g1,
        equipe2: g2,
        score1: 0,
        score2: 0,
        tab1: null,
        tab2: null,
      },
    ])

    if (error) {
      console.error(error)
      alert("Erreur génération finale")
      return
    }

    await charger()
    alert("Finale générée")
  }

  async function enregistrerScores() {
    setSaving(true)

    try {
      for (const match of matchs) {
        if (!match.id) continue

        const { error } = await supabase
          .from("national_competition")
          .update({
            score1: match.score1 ?? 0,
            score2: match.score2 ?? 0,
            tab1: match.tab1 ?? null,
            tab2: match.tab2 ?? null,
          })
          .eq("id", match.id)

        if (error) throw error
      }

      alert("Scores enregistrés")
      await charger()
    } catch (error) {
      console.error(error)
      alert("Erreur enregistrement scores")
    } finally {
      setSaving(false)
    }
  }

  async function publierVersPagePublique() {
    alert("La page publique /national lit déjà la base.")
  }

  async function resetNational() {
    const ok = window.confirm("Confirmer le reset national de cette catégorie ?")
    if (!ok) return

    const { error } = await supabase
      .from("national_competition")
      .delete()
      .eq("categorie", categorie)

    if (error) {
      console.error(error)
      alert("Erreur reset national")
      return
    }

    await charger()
    alert("Reset national effectué")
  }

  function renduScoreEditor(match: MatchNational) {
    const s1 = match.score1 ?? 0
    const s2 = match.score2 ?? 0
    const phase = (match.phase || "").toLowerCase()

    const matchElimination =
      phase === "demi-finale" ||
      phase === "demi" ||
      phase === "demi_finale" ||
      phase === "finale"

    const egalite = s1 === s2
    const besoinTAB = matchElimination && egalite

    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 16,
          background: "#fafafa",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            {match.equipe1} vs {match.equipe2}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#6b7280",
              background: "#eef2ff",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {match.phase || "poule"} {match.poule ? `• Poule ${match.poule}` : ""}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="number"
            value={match.score1 ?? 0}
            onChange={(e) =>
              setMatchField(match.id, "score1", parseNum(e.target.value) ?? 0)
            }
            style={{
              width: 80,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
            }}
          />
          <span style={{ fontWeight: 800 }}>-</span>
          <input
            type="number"
            value={match.score2 ?? 0}
            onChange={(e) =>
              setMatchField(match.id, "score2", parseNum(e.target.value) ?? 0)
            }
            style={{
              width: 80,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #d1d5db",
            }}
          />
        </div>

        {besoinTAB && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Tirs au but</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="number"
                value={match.tab1 ?? 0}
                onChange={(e) =>
                  setMatchField(match.id, "tab1", parseNum(e.target.value) ?? 0)
                }
                style={{
                  width: 80,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                }}
              />
              <span style={{ fontWeight: 800 }}>-</span>
              <input
                type="number"
                value={match.tab2 ?? 0}
                onChange={(e) =>
                  setMatchField(match.id, "tab2", parseNum(e.target.value) ?? 0)
                }
                style={{
                  width: 80,
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
          </div>
        )}

        {matchElimination && egalite && (
          <p style={{ marginTop: 10, color: "#b91c1c" }}>
            En cas d'égalité, il faut départager aux tirs au but.
          </p>
        )}

        <div style={{ marginTop: 10, fontSize: 14, color: "#374151" }}>
          Vainqueur : <strong>{gagnantMatch(match) || "-"}</strong>
        </div>
      </div>
    )
  }

  const champion = finale ? gagnantMatch(finale) : null

  return (
    <main style={{ padding: 24, maxWidth: 1250, margin: "0 auto" }}>
      <div
        style={{
          background: "linear-gradient(90deg, #ea580c 0%, #ffffff 50%, #16a34a 100%)",
          color: "#111827",
          padding: 24,
          borderRadius: 22,
          marginBottom: 24,
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.85 }}>Pilotage compétition LIFA</div>
        <h1 style={{ margin: "8px 0", fontSize: 40 }}>🔐 Admin phase nationale</h1>
        <div style={{ fontSize: 17 }}>
          Gestion des qualifiés, des poules, des matchs, des demi-finales et de la finale.
        </div>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 22,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ marginBottom: 10, fontWeight: 700 }}>Catégorie</div>

        <select
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          style={{
            padding: 10,
            minWidth: 220,
            borderRadius: 10,
            border: "1px solid #d1d5db",
          }}
        >
          <option value="U11">U11</option>
          <option value="U13">U13</option>
          <option value="U15">U15</option>
          <option value="U17">U17</option>
        </select>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 18,
          }}
        >
          <button style={buttonBaseStyle} onClick={actualiserQualifies}>
            Actualiser les qualifiés
          </button>

          <button style={buttonBaseStyle} onClick={genererPoulesNationales}>
            Générer poules nationales
          </button>

          <button style={buttonBaseStyle} onClick={genererMatchs}>
            Générer matchs
          </button>

          <button style={buttonBaseStyle} onClick={genererDemiFinales}>
            Générer demi-finales
          </button>

          <button style={buttonBaseStyle} onClick={genererFinale}>
            Générer finale
          </button>

          <button style={buttonSecondaryStyle} onClick={enregistrerScores} disabled={saving}>
            {saving ? "Sauvegarde..." : "Enregistrer scores"}
          </button>

          <button style={buttonSecondaryStyle} onClick={publierVersPagePublique}>
            Publier vers page publique
          </button>

          <button style={buttonDangerStyle} onClick={resetNational}>
            Reset national
          </button>
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}>
              <div style={{ color: "#6b7280", fontSize: 14 }}>Équipes qualifiées</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginTop: 10 }}>{qualifies.length}</div>
            </div>

            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}>
              <div style={{ color: "#6b7280", fontSize: 14 }}>Poules</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginTop: 10 }}>{poules.length}</div>
            </div>

            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}>
              <div style={{ color: "#6b7280", fontSize: 14 }}>Matchs de poules</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginTop: 10 }}>{matchsPoules.length}</div>
            </div>

            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 18, padding: 16 }}>
              <div style={{ color: "#6b7280", fontSize: 14 }}>Champion provisoire</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 10 }}>{champion || "-"}</div>
            </div>
          </section>

          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 22,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Équipes qualifiées ({categorie})</h2>

            {qualifies.length === 0 ? (
              <p>Aucune équipe qualifiée.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                }}
              >
                {qualifies.map((team, index) => (
                  <div
                    key={team.id || index}
                    style={{
                      padding: 16,
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      background: "#fafafa",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 22 }}>{nomEquipe(team)}</div>
                    <div style={{ marginTop: 8, color: "#6b7280" }}>
                      District : {districtEquipe(team)}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      Région : {regionEquipe(team)}
                    </div>
                    <div style={{ color: "#6b7280" }}>
                      Zone : {zoneEquipe(team)}
                    </div>
                    <div style={{ color: "#2563eb", fontSize: 14, marginTop: 8 }}>
                      {team.statut || ""}
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
              borderRadius: 22,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Poules</h2>

            {poules.length === 0 ? (
              <p>Aucune poule générée.</p>
            ) : (
              poules.map((poule) => {
                const classement = calculerClassementPoule(poule)

                return (
                  <div key={poule} style={{ marginBottom: 28 }}>
                    <h3>Poule {poule}</h3>

                    <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                      {matchsPoules
                        .filter((m) => m.poule === poule)
                        .map((match, index) => (
                          <div key={match.id || index}>{renduScoreEditor(match)}</div>
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
              borderRadius: 22,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Demi-finales</h2>

            {demiFinales.length === 0 ? (
              <p>Aucune demi-finale générée.</p>
            ) : (
              demiFinales.map((match, index) => (
                <div key={match.id || index}>{renduScoreEditor(match)}</div>
              ))
            )}
          </section>

          <section
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 22,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Finale</h2>

            {!finale ? <p>Aucune finale générée.</p> : renduScoreEditor(finale)}
          </section>

          <section
            style={{
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: 22,
              padding: 20,
              textAlign: "center",
            }}
          >
            <div style={{ color: "#6b7280", marginBottom: 8 }}>Champion national</div>
            <div style={{ fontSize: 36, fontWeight: 900 }}>🏆 {champion || "-"}</div>
          </section>
        </>
      )}
    </main>
  )
}