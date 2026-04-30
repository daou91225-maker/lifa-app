"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../../lib/supabase"

type Equipe = {
  id: string
  nom: string
  categorie: string
  zone: string
}

type MatchZone = {
  id?: string
  equipe1: string
  equipe2: string
  score1?: number
  score2?: number
  categorie: string
  zone: string
  poule?: string
}

type PoulesMap = {
  [key: string]: Equipe[]
}

export default function AdminZonePage() {
  const [categorie, setCategorie] = useState("U17")
  const [zone, setZone] = useState("Yamoussoukro")
  const [zones, setZones] = useState<string[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [matchs, setMatchs] = useState<MatchZone[]>([])
  const [poules, setPoules] = useState<PoulesMap>({})
  const [loading, setLoading] = useState(false)
  const [scoresModifies, setScoresModifies] = useState(false)

  useEffect(() => {
    chargerZones()
  }, [])

  useEffect(() => {
    rechargerZone()
  }, [zone, categorie])

  const rechargerZone = async () => {
    setPoules({})
    setScoresModifies(false)
    await chargerEquipes()
    await chargerMatchs()
  }

  const chargerZones = async () => {
    const { data, error } = await supabase
      .from("zones")
      .select("nom")
      .order("nom", { ascending: true })

    if (error) {
      alert("Erreur chargement zones")
      console.log(error)
      return
    }

    const listeZones = data?.map((z: any) => z.nom) || []
    setZones(listeZones)

    if (listeZones.length > 0 && !listeZones.includes(zone)) {
      setZone(listeZones[0])
    }
  }

  const chargerEquipes = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("equipes")
      .select("*")
      .eq("categorie", categorie)
      .eq("zone", zone)
      .order("nom", { ascending: true })

    setLoading(false)

    if (error) {
      alert("Erreur chargement équipes")
      console.log(error)
      return
    }

    setEquipes(data || [])
  }

  const chargerMatchs = async () => {
    const { data, error } = await supabase
      .from("matchs_zone")
      .select("*")
      .eq("categorie", categorie)
      .eq("zone", zone)
      .order("poule", { ascending: true })
      .order("equipe1", { ascending: true })

    if (error) {
      alert("Erreur chargement matchs")
      console.log(error)
      return
    }

    setMatchs(
      (data || []).map((m: any) => ({
        ...m,
        score1: m.score1 ?? 0,
        score2: m.score2 ?? 0,
      }))
    )
  }

  const resetZone = async () => {
    const ok = window.confirm(
      `Cela va supprimer les matchs de ${zone} en ${categorie}. Continuer ?`
    )
    if (!ok) return

    const { error } = await supabase
      .from("matchs_zone")
      .delete()
      .eq("categorie", categorie)
      .eq("zone", zone)

    if (error) {
      alert("Erreur reset zone")
      console.log(error)
      return
    }

    setPoules({})
    setMatchs([])
    setScoresModifies(false)
    alert("✅ Zone réinitialisée")
  }

  const melanger = <T,>(tableau: T[]) => {
    const copie = [...tableau]
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copie[i], copie[j]] = [copie[j], copie[i]]
    }
    return copie
  }

  const genererPoules = () => {
    const nb = equipes.length

    if (nb === 0) {
      alert("Aucune équipe dans cette zone")
      return
    }

    if (nb === 1) {
      setPoules({ A: [...equipes] })
      alert("✅ Une seule équipe : qualification directe provisoire")
      return
    }

    const equipesMelangees = melanger(equipes)
    let nbPoules = 1

    if (nb >= 7 && nb <= 10) nbPoules = 2
    else if (nb >= 11 && nb <= 15) nbPoules = 3
    else if (nb >= 16) nbPoules = 4

    const lettres = ["A", "B", "C", "D"]
    const nouvellesPoules: PoulesMap = {}

    for (let i = 0; i < nbPoules; i++) {
      nouvellesPoules[lettres[i]] = []
    }

    equipesMelangees.forEach((equipe, index) => {
      const lettre = lettres[index % nbPoules]
      nouvellesPoules[lettre].push(equipe)
    })

    setPoules(nouvellesPoules)
    alert(`✅ ${nbPoules} poule(s) générée(s)`)
  }

  const creerMatchsPourListe = (liste: Equipe[], poule: string) => {
    const resultat: MatchZone[] = []

    for (let i = 0; i < liste.length; i++) {
      for (let j = i + 1; j < liste.length; j++) {
        resultat.push({
          equipe1: liste[i].nom,
          equipe2: liste[j].nom,
          score1: 0,
          score2: 0,
          categorie,
          zone,
          poule,
        })
      }
    }

    return resultat
  }

  const genererMatchs = async () => {
    if (equipes.length === 0) {
      alert("Aucune équipe")
      return
    }

    if (equipes.length === 1) {
      alert("Une seule équipe : aucun match à générer")
      return
    }

    if (Object.keys(poules).length === 0) {
      alert("Tu dois d'abord générer les poules")
      return
    }

    const confirmation = window.confirm(
      "Cela va supprimer les anciens matchs de cette zone/catégorie et générer les nouveaux matchs. Continuer ?"
    )
    if (!confirmation) return

    const { error: deleteError } = await supabase
      .from("matchs_zone")
      .delete()
      .eq("categorie", categorie)
      .eq("zone", zone)

    if (deleteError) {
      alert("Erreur suppression anciens matchs")
      console.log(deleteError)
      return
    }

    let nouveauxMatchs: MatchZone[] = []

    Object.keys(poules).forEach((lettre) => {
      nouveauxMatchs = [
        ...nouveauxMatchs,
        ...creerMatchsPourListe(poules[lettre], lettre),
      ]
    })

    if (nouveauxMatchs.length === 0) {
      alert("Aucun match à générer")
      return
    }

    const { error: insertError } = await supabase
      .from("matchs_zone")
      .insert(nouveauxMatchs)

    if (insertError) {
      alert("Erreur génération matchs")
      console.log(insertError)
      return
    }

    setScoresModifies(false)
    await chargerMatchs()
    alert("✅ Matchs générés")
  }

  const mettreAJourScoreLocal = (
    indexMatch: number,
    champ: "score1" | "score2",
    valeur: string
  ) => {
    const copie = [...matchs]
    const nombre = valeur === "" ? 0 : Number(valeur)

    copie[indexMatch] = {
      ...copie[indexMatch],
      [champ]: Number.isNaN(nombre) ? 0 : nombre,
    }

    setMatchs(copie)
    setScoresModifies(true)
  }

  const enregistrerScores = async () => {
    if (matchs.length === 0) {
      alert("Aucun match à enregistrer")
      return
    }

    for (const match of matchs) {
      if (!match.id) continue

      const { error } = await supabase
        .from("matchs_zone")
        .update({
          score1: match.score1 ?? 0,
          score2: match.score2 ?? 0,
        })
        .eq("id", match.id)

      if (error) {
        alert("Erreur enregistrement scores")
        console.log(error)
        return
      }
    }

    setScoresModifies(false)
    await chargerMatchs()
    alert("✅ Scores enregistrés")
  }

  const calculerQualifies = async () => {
    if (equipes.length === 0) {
      alert("Aucune équipe")
      return
    }

    if (equipes.length === 1) {
      await supabase
        .from("qualifies")
        .delete()
        .eq("categorie", categorie)
        .eq("zone", zone)

      const { error } = await supabase.from("qualifies").insert({
        equipe: equipes[0].nom,
        categorie,
        zone,
        poule: "A",
        statut_qualification: "qualification_directe",
        rang: 1,
        points: 0,
        difference_buts: 0,
        buts_marques: 0,
        matchs_joues: 0,
        points_par_match: 0,
      })

      if (error) {
        alert("Erreur qualification directe")
        console.log(error)
        return
      }

      alert("✅ Qualification directe enregistrée")
      return
    }

    if (matchs.length === 0) {
      alert("Aucun match pour calculer les qualifiés")
      return
    }

    if (scoresModifies) {
      alert("Tu dois d'abord enregistrer les scores")
      return
    }

    const stats: any = {}

    matchs.forEach((m) => {
      const e1 = m.equipe1
      const e2 = m.equipe2
      const s1 = m.score1 ?? 0
      const s2 = m.score2 ?? 0
      const poule = m.poule || "A"

      if (!stats[e1]) {
        stats[e1] = {
          equipe: e1,
          points: 0,
          buts: 0,
          encaisses: 0,
          matchs: 0,
          poule,
        }
      }

      if (!stats[e2]) {
        stats[e2] = {
          equipe: e2,
          points: 0,
          buts: 0,
          encaisses: 0,
          matchs: 0,
          poule,
        }
      }

      stats[e1].buts += s1
      stats[e1].encaisses += s2
      stats[e1].matchs += 1

      stats[e2].buts += s2
      stats[e2].encaisses += s1
      stats[e2].matchs += 1

      if (s1 > s2) {
        stats[e1].points += 3
      } else if (s2 > s1) {
        stats[e2].points += 3
      } else {
        stats[e1].points += 1
        stats[e2].points += 1
      }
    })

    const liste = Object.values(stats).map((e: any) => ({
      ...e,
      diff: e.buts - e.encaisses,
      ppm: e.matchs > 0 ? e.points / e.matchs : 0,
    }))

    const groupes: any = {}

    liste.forEach((e: any) => {
      if (!groupes[e.poule]) groupes[e.poule] = []
      groupes[e.poule].push(e)
    })

    let qualifies: any[] = []

    Object.keys(groupes).forEach((poule) => {
      const classement = groupes[poule].sort(
        (a: any, b: any) =>
          b.points - a.points ||
          b.diff - a.diff ||
          b.buts - a.buts
      )

      if (classement[0]) {
        qualifies.push({
          ...classement[0],
          statut: "champion_poule",
          rang: 1,
        })
      }
    })

    await supabase
      .from("qualifies")
      .delete()
      .eq("categorie", categorie)
      .eq("zone", zone)

    const dataToInsert = qualifies.map((e: any) => ({
      equipe: e.equipe,
      categorie,
      zone,
      poule: e.poule,
      statut_qualification: e.statut,
      rang: e.rang,
      points: e.points,
      difference_buts: e.diff,
      buts_marques: e.buts,
      matchs_joues: e.matchs,
      points_par_match: e.ppm,
    }))

    const { error } = await supabase.from("qualifies").insert(dataToInsert)

    if (error) {
      alert("Erreur calcul qualifiés")
      console.log(error)
      return
    }

    alert("✅ Qualifiés calculés")
  }

  const formatDetecte = useMemo(() => {
    const nb = equipes.length
    if (nb === 0) return "Aucune équipe"
    if (nb === 1) return "Qualification directe"
    if (nb === 2) return "Match direct"
    if (nb === 3) return "Mini championnat"
    if (nb >= 4 && nb <= 6) return "1 poule"
    if (nb >= 7 && nb <= 10) return "2 poules"
    if (nb >= 11 && nb <= 15) return "3 poules"
    return "4 poules"
  }, [equipes.length])

  const matchsParPoule = useMemo(() => {
    const groupes: { [key: string]: MatchZone[] } = {}
    matchs.forEach((m) => {
      const lettre = m.poule || "A"
      if (!groupes[lettre]) groupes[lettre] = []
      groupes[lettre].push(m)
    })
    return groupes
  }, [matchs])

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 20 }}>🏆 Admin Zone</h1>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
          background: "white",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <a href="/inscriptions" style={{ padding: "10px 14px", background: "#f97316", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          ➕ Inscriptions
        </a>

        <a href="/clubs" style={{ padding: "10px 14px", background: "#16a34a", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          ⚽ Clubs
        </a>

        <a href="/matchs" style={{ padding: "10px 14px", background: "#2563eb", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          🗓️ Matchs
        </a>

        <a href="/exports" style={{ padding: "10px 14px", background: "#7c3aed", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          📤 Exports
        </a>

        <a href="/admin-national" style={{ padding: "10px 14px", background: "#111827", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          🏆 National
        </a>

        <a href="/" style={{ padding: "10px 14px", background: "#64748b", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          🏠 Accueil
        </a>
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <label>Catégorie :</label>
          <br />
          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
            style={{ padding: 10, marginTop: 8, minWidth: 300 }}
          >
            <option value="U11">U11</option>
            <option value="U13">U13</option>
            <option value="U15">U15</option>
            <option value="U17">U17</option>
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label>Zone :</label>
          <br />
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            style={{ padding: 10, marginTop: 8, minWidth: 300 }}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div style={{ fontWeight: 700, marginBottom: 16 }}>
          Format détecté : {formatDetecte}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={chargerEquipes}>Actualiser équipes</button>
          <button onClick={genererPoules}>Générer poules</button>
          <button onClick={genererMatchs}>Générer matchs</button>
          <button onClick={enregistrerScores}>Enregistrer scores</button>
          <button onClick={calculerQualifies}>Calculer qualifiés</button>
          <button onClick={chargerMatchs}>Voir les matchs</button>
          <button onClick={resetZone} style={{ background: "#b91c1c", color: "white" }}>
            Reset zone
          </button>
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}
      >
        <h2>Équipes ({equipes.length})</h2>
        {loading ? (
          <p>Chargement...</p>
        ) : equipes.length === 0 ? (
          <p>Aucune équipe</p>
        ) : (
          equipes.map((e) => <div key={e.id}>{e.nom}</div>)
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}
      >
        <h2>Poules</h2>
        {Object.keys(poules).length === 0 ? (
          <p>Aucune poule générée</p>
        ) : (
          Object.keys(poules).map((lettre) => (
            <div key={lettre} style={{ marginBottom: 20 }}>
              <h3>Poule {lettre}</h3>
              {poules[lettre].map((e) => (
                <div key={e.id}>{e.nom}</div>
              ))}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          marginBottom: 20,
        }}
      >
        <h2>Matchs</h2>
        {matchs.length === 0 ? (
          <p>Aucun match</p>
        ) : (
          Object.keys(matchsParPoule).map((lettre) => (
            <div key={lettre} style={{ marginBottom: 24 }}>
              <h3>Poule {lettre}</h3>
              {matchsParPoule[lettre].map((m) => {
                const indexGlobal = matchs.findIndex((x) => x.id === m.id)

                return (
                  <div
                    key={m.id}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      padding: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>
                      {m.equipe1} vs {m.equipe2}
                    </div>

                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        min="0"
                        value={m.score1 ?? 0}
                        onChange={(e) =>
                          mettreAJourScoreLocal(indexGlobal, "score1", e.target.value)
                        }
                        style={{ width: 70, padding: 8 }}
                      />

                      <span>-</span>

                      <input
                        type="number"
                        min="0"
                        value={m.score2 ?? 0}
                        onChange={(e) =>
                          mettreAJourScoreLocal(indexGlobal, "score2", e.target.value)
                        }
                        style={{ width: 70, padding: 8 }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
      </div>
    </main>
  )
}