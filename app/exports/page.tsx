"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type ClubExportItem = {
  nom: string;
  region: string;
  district: string;
};

type ClassementItem = {
  club: string;
  pts: number;
  mj: number;
  v: number;
  n: number;
  d: number;
  bp: number;
  bc: number;
  diff: number;
};

type ChampionDistrict = {
  district: string;
  club: string;
  pts: number;
  diff: number;
  bp: number;
};

type ChampionRegional = {
  region: string;
  club: string;
  pts: number;
  diff: number;
  bp: number;
};

export default function ExportsPage() {
  const categories = ["U11", "U13", "U15", "U17"];

  const [categorie, setCategorie] = useState("U11");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [texteExport, setTexteExport] = useState("");

  const [matchs, setMatchs] = useState<MatchResult[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("matchs_pro");
    if (data) {
      setMatchs(JSON.parse(data));
    }
  }, []);

  const matchsCategorie = useMemo(() => {
    return matchs.filter((m) => m.categorie === categorie);
  }, [matchs, categorie]);

  const regions = [...new Set(matchsCategorie.map((m) => m.region))];

  const districts = matchsCategorie
    .filter((m) => m.region === region)
    .map((m) => m.district)
    .filter((v, i, a) => a.indexOf(v) === i);

  const matchsDistrict = useMemo(() => {
    return matchsCategorie.filter(
      (m) => m.region === region && m.district === district
    );
  }, [matchsCategorie, region, district]);

  const clubsDistrict = useMemo(() => {
    const map = new Map<string, ClubExportItem>();

    matchsDistrict.forEach((m) => {
      if (!map.has(m.equipe1)) {
        map.set(m.equipe1, {
          nom: m.equipe1,
          region: m.region,
          district: m.district,
        });
      }
      if (!map.has(m.equipe2)) {
        map.set(m.equipe2, {
          nom: m.equipe2,
          region: m.region,
          district: m.district,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.nom.localeCompare(b.nom));
  }, [matchsDistrict]);

  const calculClassement = (liste: MatchResult[]): ClassementItem[] => {
    const table: Record<string, ClassementItem> = {};

    liste.forEach((m) => {
      if (!table[m.equipe1]) {
        table[m.equipe1] = initClub(m.equipe1);
      }
      if (!table[m.equipe2]) {
        table[m.equipe2] = initClub(m.equipe2);
      }

      const c1 = table[m.equipe1];
      const c2 = table[m.equipe2];

      c1.mj += 1;
      c2.mj += 1;

      c1.bp += m.score1;
      c1.bc += m.score2;
      c2.bp += m.score2;
      c2.bc += m.score1;

      if (m.score1 > m.score2) {
        c1.v += 1;
        c1.pts += 3;
        c2.d += 1;
      } else if (m.score2 > m.score1) {
        c2.v += 1;
        c2.pts += 3;
        c1.d += 1;
      } else {
        c1.n += 1;
        c2.n += 1;
        c1.pts += 1;
        c2.pts += 1;
      }
    });

    return Object.values(table)
      .map((club) => ({
        ...club,
        diff: club.bp - club.bc,
      }))
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.diff !== a.diff) return b.diff - a.diff;
        if (b.bp !== a.bp) return b.bp - a.bp;
        return a.club.localeCompare(b.club);
      });
  };

  const classementDistrict = useMemo(() => {
    return calculClassement(matchsDistrict);
  }, [matchsDistrict]);

  const championsDistrictsRegion = useMemo(() => {
    if (!region) return [] as ChampionDistrict[];

    const matchsRegion = matchsCategorie.filter((m) => m.region === region);
    const listeDistricts = [
      ...new Set(matchsRegion.map((m) => m.district)),
    ].sort((a, b) => a.localeCompare(b));

    const resultat: ChampionDistrict[] = [];

    listeDistricts.forEach((dist) => {
      const matchsDuDistrict = matchsRegion.filter((m) => m.district === dist);
      const classement = calculClassement(matchsDuDistrict);

      if (classement.length > 0) {
        resultat.push({
          district: dist,
          club: classement[0].club,
          pts: classement[0].pts,
          diff: classement[0].diff,
          bp: classement[0].bp,
        });
      }
    });

    return resultat.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.diff !== a.diff) return b.diff - a.diff;
      if (b.bp !== a.bp) return b.bp - a.bp;
      return a.club.localeCompare(b.club);
    });
  }, [matchsCategorie, region]);

  const championsRegionauxNationaux = useMemo(() => {
    const listeRegions = [...new Set(matchsCategorie.map((m) => m.region))];
    const resultat: ChampionRegional[] = [];

    listeRegions.forEach((reg) => {
      const matchsRegion = matchsCategorie.filter((m) => m.region === reg);
      const listeDistricts = [
        ...new Set(matchsRegion.map((m) => m.district)),
      ];

      const championsDistricts: ChampionDistrict[] = [];

      listeDistricts.forEach((dist) => {
        const matchsDuDistrict = matchsRegion.filter((m) => m.district === dist);
        const classement = calculClassement(matchsDuDistrict);

        if (classement.length > 0) {
          championsDistricts.push({
            district: dist,
            club: classement[0].club,
            pts: classement[0].pts,
            diff: classement[0].diff,
            bp: classement[0].bp,
          });
        }
      });

      championsDistricts.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.diff !== a.diff) return b.diff - a.diff;
        if (b.bp !== a.bp) return b.bp - a.bp;
        return a.club.localeCompare(b.club);
      });

      if (championsDistricts.length > 0) {
        resultat.push({
          region: reg,
          club: championsDistricts[0].club,
          pts: championsDistricts[0].pts,
          diff: championsDistricts[0].diff,
          bp: championsDistricts[0].bp,
        });
      }
    });

    return resultat.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.diff !== a.diff) return b.diff - a.diff;
      if (b.bp !== a.bp) return b.bp - a.bp;
      return a.club.localeCompare(b.club);
    });
  }, [matchsCategorie]);

  const exporterClubs = () => {
    if (!region || !district) {
      setTexteExport("Choisis d'abord une région et un district.");
      return;
    }

    if (clubsDistrict.length === 0) {
      setTexteExport("Aucun club trouvé pour cette sélection.");
      return;
    }

    const lignes = [
      "📋 LISTE DES CLUBS",
      `Catégorie : ${categorie}`,
      `Région : ${region}`,
      `District : ${district}`,
      "",
      ...clubsDistrict.map((club, i) => `${i + 1}. ${club.nom}`),
    ];

    setTexteExport(lignes.join("\n"));
  };

  const exporterCalendrier = () => {
    if (!region || !district) {
      setTexteExport("Choisis d'abord une région et un district.");
      return;
    }

    if (matchsDistrict.length === 0) {
      setTexteExport("Aucun match trouvé pour cette sélection.");
      return;
    }

    const lignes = [
      "🗓️ CALENDRIER DISTRICT",
      `Catégorie : ${categorie}`,
      `Région : ${region}`,
      `District : ${district}`,
      "",
      ...matchsDistrict.map(
        (m, i) =>
          `${i + 1}. ${m.equipe1} ${m.score1} - ${m.score2} ${m.equipe2}`
      ),
    ];

    setTexteExport(lignes.join("\n"));
  };

  const exporterClassementDistrict = () => {
    if (!region || !district) {
      setTexteExport("Choisis d'abord une région et un district.");
      return;
    }

    if (classementDistrict.length === 0) {
      setTexteExport("Aucun classement district disponible.");
      return;
    }

    const lignes = [
      "🏆 CLASSEMENT DISTRICT",
      `Catégorie : ${categorie}`,
      `Région : ${region}`,
      `District : ${district}`,
      "",
      ...classementDistrict.map(
        (club, i) =>
          `${i + 1}. ${club.club} | ${club.pts} pts | MJ ${club.mj} | Diff ${club.diff}`
      ),
    ];

    setTexteExport(lignes.join("\n"));
  };

  const exporterRegion = () => {
    if (!region) {
      setTexteExport("Choisis d'abord une région.");
      return;
    }

    if (championsDistrictsRegion.length === 0) {
      setTexteExport("Aucun export régional disponible.");
      return;
    }

    const champion = championsDistrictsRegion[0];

    const lignes = [
      "🌍 PHASE RÉGIONALE",
      `Catégorie : ${categorie}`,
      `Région : ${region}`,
      "",
      `Champion régional : ${champion.club}`,
      `District : ${champion.district}`,
      `Points : ${champion.pts}`,
      `Différence : ${champion.diff}`,
      "",
      "Champions des districts :",
      ...championsDistrictsRegion.map(
        (club, i) =>
          `${i + 1}. ${club.club} | District ${club.district} | ${club.pts} pts`
      ),
    ];

    setTexteExport(lignes.join("\n"));
  };

  const exporterNational = () => {
    if (championsRegionauxNationaux.length === 0) {
      setTexteExport("Aucun export national disponible.");
      return;
    }

    const champion = championsRegionauxNationaux[0];

    const lignes = [
      "🇨🇮 PHASE NATIONALE",
      `Catégorie : ${categorie}`,
      "",
      `Champion national : ${champion.club}`,
      `Région : ${champion.region}`,
      `Points : ${champion.pts}`,
      `Différence : ${champion.diff}`,
      "",
      "Champions régionaux qualifiés :",
      ...championsRegionauxNationaux.map(
        (club, i) =>
          `${i + 1}. ${club.club} | Région ${club.region} | ${club.pts} pts`
      ),
    ];

    setTexteExport(lignes.join("\n"));
  };

  const copierTexte = async () => {
    if (!texteExport.trim()) {
      alert("Aucun texte à copier");
      return;
    }

    try {
      await navigator.clipboard.writeText(texteExport);
      alert("Texte copié");
    } catch {
      alert("Copie impossible");
    }
  };

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
            📤 Diffusion officielle des données
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.15,
              color: "#111827",
            }}
          >
            Exports finaux
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
            Exports prêts à copier pour WhatsApp, districts, régions,
            organisation nationale et communication officielle.
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
            <h2 style={{ marginTop: 0 }}>🎯 Filtres d’export</h2>

            <div
              style={{
                display: "grid",
                gap: 12,
                maxWidth: 720,
              }}
            >
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
              >
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

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Choisir district</option>
                {districts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={exporterClassementDistrict}>
                  Export district
                </button>
                <button onClick={exporterRegion}>Export région</button>
                <button onClick={exporterNational}>Export national</button>
                <button onClick={exporterCalendrier}>Export matchs</button>
                <button onClick={exporterClubs}>Export clubs</button>
                <button onClick={copierTexte}>Copier le texte</button>
              </div>
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
                Matchs district
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {matchsDistrict.length}
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
                Clubs district
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {clubsDistrict.length}
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
                Champions régionaux
              </div>
              <div style={{ fontSize: 30, fontWeight: 800 }}>
                {championsRegionauxNationaux.length}
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
          }}
        >
          <h2 style={{ marginTop: 0 }}>📄 Aperçu export</h2>
          <textarea
            value={texteExport}
            onChange={(e) => setTexteExport(e.target.value)}
            rows={18}
            style={{
              width: "100%",
              maxWidth: 1000,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
              fontFamily: "monospace",
            }}
          />
        </section>
      </div>
    </main>
  );
}

function initClub(nom: string): ClassementItem {
  return {
    club: nom,
    pts: 0,
    mj: 0,
    v: 0,
    n: 0,
    d: 0,
    bp: 0,
    bc: 0,
    diff: 0,
  };
}