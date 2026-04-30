"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

type Match = {
  equipe1: string
  equipe2: string
  score1: number
  score2: number
  tab1?: number
  tab2?: number
  poule?: string
}

export default function PublicPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    charger()
  }, [])

  const charger = async () => {
    const { data, error } = await supabase
      .from("national_competition")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    setData(data)
    setLoading(false)
  }

  const formatScore = (m: Match) => {
    if (m.score1 === m.score2 && m.tab1 !== undefined && m.tab2 !== undefined) {
      return `${m.score1} - ${m.score2} (TAB ${m.tab1} - ${m.tab2})`
    }
    return `${m.score1} - ${m.score2}`
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Chargement...</p>
  }

  if (!data) {
    return <p style={{ padding: 20 }}>Aucune compétition disponible</p>
  }

  const poules = data.poules || {}
  const matchsPoules = data.matchs_poules || []
  const demi = data.matchs_demi || []
  const finale = data.match_final
  const champion = data.champion
  const equipes = data.equipes_qualifiees || []

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #f97316, #16a34a)",
          color: "white",
          padding: 24,
          borderRadius: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 14, marginBottom: 8 }}>
          Plateforme officielle LIFA
        </div>
        <h1 style={{ margin: 0, fontSize: 34 }}>CI Phase Nationale</h1>
        <p style={{ marginTop: 10 }}>
          Consultation publique des poules, matchs et champion national.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ background: "white", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Catégorie</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{data.categorie}</div>
        </div>

        <div style={{ background: "white", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Poules</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {Object.keys(poules).length}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 14, padding: 18 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Matchs de poules</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {Array.isArray(matchsPoules) ? matchsPoules.length : 0}
          </div>
        </div>

        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: 14,
            padding: 18,
          }}
        >
          <div style={{ fontSize: 13, color: "#6b7280" }}>Champion national</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>🏆 {champion || "-"}</div>
        </div>
      </div>

      <section style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Équipes qualifiées</h2>

        {equipes.length === 0 ? (
          <p>Aucune équipe qualifiée</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {equipes.map((e: any, i: number) => (
              <div
                key={i}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontWeight: 700 }}>{e.equipe}</div>
                <div style={{ color: "#6b7280", marginTop: 4 }}>{e.zone}</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#2563eb" }}>
                  {e.statut_qualification}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Poules</h2>

        {Object.keys(poules).length === 0 ? (
          <p>Aucune poule générée</p>
        ) : (
          Object.keys(poules).map((lettre) => (
            <div key={lettre} style={{ marginBottom: 24 }}>
              <h3>Poule {lettre}</h3>

              <div style={{ marginBottom: 12 }}>
                {poules[lettre].map((e: any, i: number) => (
                  <div key={i}>
                    {e.equipe} ({e.zone})
                  </div>
                ))}
              </div>

              {(matchsPoules as Match[])
                .filter((m) => m.poule === lettre)
                .map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 10,
                      marginBottom: 8,
                      background: "#f9fafb",
                    }}
                  >
                    <div>{m.equipe1} vs {m.equipe2}</div>
                    <div style={{ fontWeight: 700 }}>{formatScore(m)}</div>
                  </div>
                ))}
            </div>
          ))
        )}
      </section>

      <section style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Demi-finales</h2>

        {!Array.isArray(demi) || demi.length === 0 ? (
          <p>Pas encore jouées</p>
        ) : (
          demi.map((m: Match, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                marginBottom: 8,
                background: "#f9fafb",
              }}
            >
              <div>{m.equipe1} vs {m.equipe2}</div>
              <div style={{ fontWeight: 700 }}>{formatScore(m)}</div>
            </div>
          ))
        )}
      </section>

      <section style={{ background: "white", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <h2 style={{ marginTop: 0 }}>Finale</h2>

        {!finale || !finale.equipe1 ? (
          <p>Pas encore jouée</p>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              background: "#f9fafb",
            }}
          >
            <div>{finale.equipe1} vs {finale.equipe2}</div>
            <div style={{ fontWeight: 700 }}>{formatScore(finale)}</div>
          </div>
        )}
      </section>

      {champion && (
        <section
          style={{
            background: "#dcfce7",
            border: "1px solid #86efac",
            borderRadius: 16,
            padding: 22,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, color: "#166534", marginBottom: 6 }}>
            Champion officiel
          </div>
          <div style={{ fontSize: 30, fontWeight: 800 }}>🏆 {champion}</div>
        </section>
      )}
    </main>
  )
}