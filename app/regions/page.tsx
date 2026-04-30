"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MatchResult = {
  id: number;
  categorie: string;
  region: string;
  district: string;
  equipe1: string;
  equipe2: string;
  score1: number;
  score2: number;
};

type LigneClassement = {
  club: string;
  mj: number;
  v: number;
  n: number;
  d: number;
  bp: number;
  bc: number;
  diff: number;
  pts: number;
};

type ChampionDistrict = {
  district: string;
  club: string;
  pts: number;
  diff: number;
  bp: number;
};

export default function RegionsPage() {
  const categories = ["U11", "U13", "U15", "U17"];

  const [matchs, setMatchs] = useState<MatchResult[]>([]);
  const [categorie, setCategorie] = useState("U11");
  const [region, setRegion] = useState("");

  useEffect(() => {
    const data = localStorage.getItem("matchs_pro");
    if (data) {
      setMatchs(JSON.parse(data));
    }
  }, []);

  const regions = [...new Set(matchs.map((m) => m.region))];

  const matchsRegion = useMemo(() => {
    return matchs.filter(
      (m) => m.categorie === categorie && m.region === region
    );
  }, [matchs, categorie, region]);

  const districts = [...new Set(matchsRegion.map((m) => m.district))];

  const championsDistricts = useMemo(() => {
    const resultat: ChampionDistrict[] = [];

    districts.forEach((district) => {
      const matchsDistrict = matchsRegion.filter((m) => m.district === district);

      const table: Record<string, LigneClassement> = {};

      matchsDistrict.forEach((m) => {
        if (!table[m.equipe1]) {
          table[m.equipe1] = {
            club: m.equipe1,
            mj: 0,
            v: 0,
            n: 0,
            d: 0,
            bp: 0,
            bc: 0,
            diff: 0,
            pts: 0,
          };
        }

        if (!table[m.equipe2]) {
          table[m.equipe2] = {
            club: m.equipe2,
            mj: 0,
            v: 0,
            n: 0,
            d: 0,
            bp: 0,
            bc: 0,
            diff: 0,
            pts: 0,
          };
        }

        table[m.equipe1].mj += 1;
        table[m.equipe2].mj += 1;

        table[m.equipe1].bp += m.score1;
        table[m.equipe1].bc += m.score2;
        table[m.equipe2].bp += m.score2;
        table[m.equipe2].bc += m.score1;

        if (m.score1 > m.score2) {
          table[m.equipe1].v += 1;
          table[m.equipe1].pts += 3;
          table[m.equipe2].d += 1;
        } else if (m.score1 < m.score2) {
          table[m.equipe2].v += 1;
          table[m.equipe2].pts += 3;
          table[m.equipe1].d += 1;
        } else {
          table[m.equipe1].n += 1;
          table[m.equipe2].n += 1;
          table[m.equipe1].pts += 1;
          table[m.equipe2].pts += 1;
        }
      });

      const classement = Object.values(table).map((club) => ({
        ...club,
        diff: club.bp - club.bc,
      }));

      classement.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.diff !== a.diff) return b.diff - a.diff;
        if (b.bp !== a.bp) return b.bp - a.bp;
        return a.club.localeCompare(b.club);
      });

      if (classement.length > 0) {
        resultat.push({
          district,
          club: classement[0].club,
          pts: classement[0].pts,
          diff: classement[0].diff,
          bp: classement[0].bp,
        });
      }
    });

    return resultat.sort((a, b) => a.district.localeCompare(b.district));
  }, [districts, matchsRegion]);

  const podiumRegional = useMemo(() => {
    const liste = [...championsDistricts];

    liste.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.diff !== a.diff) return b.diff - a.diff;
      if (b.bp !== a.bp) return b.bp - a.bp;
      return a.club.localeCompare(b.club);
    });

    return liste;
  }, [championsDistricts]);

  const championRegional = podiumRegional.length > 0 ? podiumRegional[0] : null;

  return (
    <main style={{ padding: 30 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/">⬅ Retour accueil</Link>
        </div>

        <section
          style={{
            borderRadius: 22,
            padding: 26,
            marginBottom: 26,
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.96), rgba(255,255,255,0.96), rgba(22,163,74,0.96))",
            boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 10,
              color: "#374151",
            }}
          >
            🌍 Lecture automatique du niveau régional
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.15,
              color: "#111827",
            }}
          >
            Régions Pro
          </h1>

          <p
            style={{
              marginTop: 14,
              marginBottom: 0,
              color: "#1f2937",
              fontSize: 16,
              lineHeight: 1.6,
              maxWidth: 850,
            }}
          >
            Le champion régional est automatiquement déterminé à partir des
            champions de district pour une région donnée.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: 18,
            marginBottom: 26,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: 22,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🎯 Sélection de la région</h2>

            <div
              style={{
                display: "grid",
                gap: 12,
                maxWidth: 720,
              }}
            >
              <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                <option value="">Choisir région</option>
                {regions.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 18,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Districts comparés
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {championsDistricts.length}
              </div>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 18,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Matchs région pris en compte
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {matchsRegion.length}
              </div>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 18,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Champion régional
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {championRegional ? championRegional.club : "-"}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "white",
            borderRadius: 18,
            padding: 22,
            border: "1px solid #e5e7eb",
            boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
            marginBottom: 26,
          }}
        >
          <h2 style={{ marginTop: 0 }}>🏆 Champion régional</h2>

          {!championRegional ? (
            <p>Aucun champion régional disponible pour cette sélection.</p>
          ) : (
            <div
              style={{
                border: "2px solid #16a34a",
                borderRadius: 18,
                padding: 22,
                background: "#eefcf7",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: 10 }}>
                🌍 {championRegional.club}
              </h2>
              <p style={{ margin: "8px 0" }}>
                <strong>District :</strong> {championRegional.district}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Points :</strong> {championRegional.pts}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Différence :</strong> {championRegional.diff}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Buts pour :</strong> {championRegional.bp}
              </p>
            </div>
          )}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            gap: 18,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: 22,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🥉 Podium régional</h2>

            {podiumRegional.length === 0 ? (
              <p>Aucun podium disponible.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {podiumRegional.slice(0, 3).map((club, i) => (
                  <div
                    key={`${club.district}-${club.club}`}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: 14,
                      background: "#ffffff",
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>
                      {i + 1}. {club.club}
                    </div>
                    <div style={{ color: "#4b5563" }}>
                      District : {club.district} | {club.pts} pts
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 18,
              padding: 22,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>📊 Champions des districts</h2>

            {championsDistricts.length === 0 ? (
              <p>Aucun champion de district trouvé.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      <th>District</th>
                      <th>Club</th>
                      <th>Pts</th>
                      <th>Diff</th>
                      <th>BP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {championsDistricts.map((item) => (
                      <tr key={item.district}>
                        <td>{item.district}</td>
                        <td>
                          <strong>{item.club}</strong>
                        </td>
                        <td>{item.pts}</td>
                        <td>{item.diff}</td>
                        <td>{item.bp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}