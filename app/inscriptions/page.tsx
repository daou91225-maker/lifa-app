"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Paiement = "Non payé" | "Payé";
type Statut = "En attente" | "Validé" | "Refusé";

type InscriptionItem = {
  id: number;
  nomClub: string;
  responsable: string;
  telephone: string;
  email: string;
  region: string;
  district: string;
  categories: string[];
  paiement: Paiement;
  statut: Statut;
};

export default function InscriptionsPage() {
  const regions = [
    "Abidjan Nord",
    "Abidjan Sud",
    "Bas-Sassandra",
    "Comoé",
    "Denguélé",
    "Gôh-Djiboua",
    "Lacs",
    "Lagunes",
    "Montagnes",
    "Marahoué",
    "Sassandra",
    "Savanes",
    "Vallée du Bandama",
    "Woroba",
    "Yamoussoukro",
    "Zanzan",
  ];

  const categoriesDisponibles = ["U11", "U13", "U15", "U17"];

  const districtsParRegion: Record<string, string[]> = {
    "Abidjan Nord": ["Abobo", "Cocody", "Anyama", "Bingerville"],
    "Abidjan Sud": ["Yopougon", "Marcory", "Port-Bouët", "Treichville"],
    "Bas-Sassandra": ["Soubré", "Méagui", "Guéyo"],
    Comoé: ["Aboisso", "Adiaké", "Grand-Bassam"],
    Denguélé: ["Odienné", "Kaniasso", "Minignan"],
    "Gôh-Djiboua": ["Gagnoa", "Divo", "Lakota"],
    Lacs: ["Bélier", "Iffou", "N'Zi", "Moronou"],
    Lagunes: ["Dabou", "Jacqueville", "Grand-Lahou"],
    Montagnes: ["Man", "Biankouma", "Danané"],
    Marahoué: ["Bouaflé", "Sinfra", "Zuénoula"],
    Sassandra: ["San Pedro", "Sassandra", "Tabou"],
    Savanes: ["Korhogo", "Ferkessédougou", "Boundiali"],
    "Vallée du Bandama": ["Bouaké", "Sakassou", "Béoumi"],
    Woroba: ["Séguéla", "Touba", "Mankono"],
    Yamoussoukro: ["Yamoussoukro Centre", "Attiégouakro", "Kossou"],
    Zanzan: ["Bondoukou", "Bouna", "Tanda"],
  };

  const [inscriptions, setInscriptions] = useState<InscriptionItem[]>([]);
  const [nomClub, setNomClub] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState(regions[0]);
  const [district, setDistrict] = useState(districtsParRegion[regions[0]][0]);
  const [categories, setCategories] = useState<string[]>([]);
  const [paiement, setPaiement] = useState<Paiement>("Non payé");
  const [statut, setStatut] = useState<Statut>("En attente");

  const [filtreRegion, setFiltreRegion] = useState("Toutes");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtrePaiement, setFiltrePaiement] = useState("Tous");
  const [recherche, setRecherche] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    fontSize: 15,
    boxSizing: "border-box",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "13px 16px",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    background: "linear-gradient(135deg, #f97316, #16a34a)",
    color: "white",
  };

  const convertirDepuisSupabase = (item: any): InscriptionItem => ({
    id: item.id,
    nomClub: item.nom_club || "",
    responsable: item.responsable || "",
    telephone: item.telephone || "",
    email: item.email || "",
    region: item.region || "",
    district: item.district || "",
    categories: item.categories ? String(item.categories).split(", ").filter(Boolean) : [],
    paiement: (item.paiement || "Non payé") as Paiement,
    statut: (item.statut || "En attente") as Statut,
  });

  const chargerInscriptions = async () => {
    const { data, error } = await supabase
      .from("inscriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erreur chargement inscriptions.");
      return;
    }

    setInscriptions((data || []).map(convertirDepuisSupabase));
  };

  useEffect(() => {
    chargerInscriptions();
  }, []);

  useEffect(() => {
    const districts = districtsParRegion[region] || [];
    setDistrict(districts[0] || "");
  }, [region]);

  const toggleCategorie = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const selectToutesCategories = () => {
    setCategories(categoriesDisponibles);
  };

  const viderFormulaire = () => {
    setNomClub("");
    setResponsable("");
    setTelephone("");
    setEmail("");
    setRegion(regions[0]);
    setDistrict(districtsParRegion[regions[0]][0]);
    setCategories([]);
    setPaiement("Non payé");
    setStatut("En attente");
  };

  const envoyerVersEquipes = async (item: InscriptionItem) => {
    if (item.paiement !== "Payé" || item.statut !== "Validé") return;

    for (const categorie of item.categories) {
      const { data: existeDeja } = await supabase
        .from("equipes")
        .select("id")
        .eq("nom", item.nomClub)
        .eq("categorie", categorie)
        .eq("zone", item.region)
        .limit(1);

      if (existeDeja && existeDeja.length > 0) continue;

      const { error } = await supabase.from("equipes").insert([
        {
          nom: item.nomClub,
          categorie,
          district: item.district,
          region: item.region,
          zone: item.region,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erreur transfert vers équipes.");
        return;
      }
    }
  };

  const ajouterInscription = async () => {
    if (!nomClub.trim()) {
      alert("Nom du club obligatoire.");
      return;
    }

    if (categories.length === 0) {
      alert("Choisis au moins une catégorie.");
      return;
    }

    const existe = inscriptions.some(
      (item) =>
        item.nomClub.toLowerCase() === nomClub.trim().toLowerCase() &&
        item.region === region
    );

    if (existe) {
      alert("Attention : ce club existe déjà dans cette zone.");
      return;
    }

    const { data, error } = await supabase
      .from("inscriptions")
      .insert([
        {
          nom_club: nomClub.trim(),
          responsable: responsable.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          region,
          district,
          categories: categories.join(", "),
          paiement,
          statut,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Erreur enregistrement.");
      return;
    }

    const nouvelle = convertirDepuisSupabase(data);
    setInscriptions([nouvelle, ...inscriptions]);
    await envoyerVersEquipes(nouvelle);
    viderFormulaire();
    alert("✅ Inscription enregistrée.");
  };

  const changerPaiement = async (id: number, valeur: Paiement) => {
    const actuelle = inscriptions.find((i) => i.id === id);
    if (!actuelle) return;

    const modifiee = { ...actuelle, paiement: valeur };

    const { error } = await supabase
      .from("inscriptions")
      .update({ paiement: valeur })
      .eq("id", id);

    if (error) {
      alert("Erreur modification paiement.");
      return;
    }

    setInscriptions((prev) => prev.map((i) => (i.id === id ? modifiee : i)));
    await envoyerVersEquipes(modifiee);
  };

  const changerStatut = async (id: number, valeur: Statut) => {
    const actuelle = inscriptions.find((i) => i.id === id);
    if (!actuelle) return;

    const modifiee = { ...actuelle, statut: valeur };

    const { error } = await supabase
      .from("inscriptions")
      .update({ statut: valeur })
      .eq("id", id);

    if (error) {
      alert("Erreur modification statut.");
      return;
    }

    setInscriptions((prev) => prev.map((i) => (i.id === id ? modifiee : i)));
    await envoyerVersEquipes(modifiee);
  };

  const validerEtPayer = async (item: InscriptionItem) => {
    const { error } = await supabase
      .from("inscriptions")
      .update({ paiement: "Payé", statut: "Validé" })
      .eq("id", item.id);

    if (error) {
      alert("Erreur validation rapide.");
      return;
    }

    const modifiee: InscriptionItem = {
      ...item,
      paiement: "Payé",
      statut: "Validé",
    };

    setInscriptions((prev) => prev.map((i) => (i.id === item.id ? modifiee : i)));
    await envoyerVersEquipes(modifiee);
    alert("✅ Club validé + envoyé dans équipes.");
  };

  const supprimerInscription = async (id: number) => {
    const ok = window.confirm("Supprimer cette inscription ?");
    if (!ok) return;

    const { error } = await supabase.from("inscriptions").delete().eq("id", id);

    if (error) {
      alert("Erreur suppression.");
      return;
    }

    setInscriptions(inscriptions.filter((item) => item.id !== id));
  };

  const totalPayes = inscriptions.filter((i) => i.paiement === "Payé").length;
  const totalValides = inscriptions.filter((i) => i.statut === "Validé").length;
  const totalAttente = inscriptions.filter((i) => i.statut === "En attente").length;
const compteurRegions = useMemo(() => {
  const compteur: Record<string, number> = {};

  regions.forEach((region) => {
    compteur[region] = 0;
  });

  inscriptions.forEach((item) => {
    if (compteur[item.region] !== undefined) {
      compteur[item.region] += 1;
    }
  });

  return compteur;
}, [inscriptions]);
const compteurDistricts = useMemo(() => {
  const compteur: Record<string, number> = {};

  inscriptions.forEach((item) => {
    if (item.district) {
      compteur[item.district] = (compteur[item.district] || 0) + 1;
    }
  });

  return compteur;
}, [inscriptions]);
  const inscriptionsFiltrees = useMemo(() => {
    return inscriptions.filter((item) => {
      const texte = `${item.nomClub} ${item.responsable} ${item.telephone}`.toLowerCase();

      return (
        (filtreRegion === "Toutes" || item.region === filtreRegion) &&
        (filtreStatut === "Tous" || item.statut === filtreStatut) &&
        (filtrePaiement === "Tous" || item.paiement === filtrePaiement) &&
        texte.includes(recherche.toLowerCase())
      );
    });
  }, [inscriptions, filtreRegion, filtreStatut, filtrePaiement, recherche]);

  return (
    <main style={{ padding: "20px 14px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/">⬅ Retour accueil</Link>
        </div>

        <section
          style={{
            borderRadius: 24,
            padding: 24,
            marginBottom: 22,
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.95), rgba(255,255,255,0.96), rgba(22,163,74,0.95))",
            boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
            ⚡ Saisie admin rapide
          </div>

          <h1 style={{ margin: 0, fontSize: "clamp(30px, 5vw, 42px)" }}>
            Inscriptions Express
          </h1>

          <p style={{ maxWidth: 850, lineHeight: 1.6 }}>
            Saisie centralisée des clubs. Les équipes deviennent visibles dans la gestion
            seulement quand elles sont <strong>payées</strong> et <strong>validées</strong>.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            ["Total", inscriptions.length],
            ["En attente", totalAttente],
            ["Payés", totalPayes],
            ["Validés", totalValides],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "white",
                borderRadius: 18,
                padding: 18,
                border: "1px solid #e5e7eb",
                boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
              }}
            >
              <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
              <div style={{ fontSize: 34, fontWeight: 900 }}>{value}</div>
            </div>
          ))}
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(300px, 420px) 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 20,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>📝 Nouvelle inscription</h2>

            <div style={{ display: "grid", gap: 12 }}>
              <input style={inputStyle} value={nomClub} onChange={(e) => setNomClub(e.target.value.toUpperCase())} placeholder="Nom du club" />
              <input style={inputStyle} value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Responsable / Président" />
              <input style={inputStyle} value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Téléphone" />
              <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />

              <select style={inputStyle} value={region} onChange={(e) => setRegion(e.target.value)}>
                {regions.map((r) => <option key={r}>{r}</option>)}
              </select>

              <select style={inputStyle} value={district} onChange={(e) => setDistrict(e.target.value)}>
                {(districtsParRegion[region] || []).map((d) => <option key={d}>{d}</option>)}
              </select>

              <div>
                <strong>Catégories :</strong>
                <button
                  type="button"
                  onClick={selectToutesCategories}
                  style={{
                    marginLeft: 10,
                    padding: "6px 10px",
                    borderRadius: 10,
                    border: "1px solid #d1d5db",
                    background: "#f8fafc",
                    fontWeight: 700,
                  }}
                >
                  Toutes
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {categoriesDisponibles.map((cat) => (
                    <label
                      key={cat}
                      style={{
                        display: "flex",
                        gap: 8,
                        padding: 12,
                        borderRadius: 12,
                        border: categories.includes(cat)
                          ? "2px solid #16a34a"
                          : "1px solid #e5e7eb",
                        background: categories.includes(cat) ? "#ecfdf5" : "#f8fafc",
                        fontWeight: 800,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(cat)}
                        onChange={() => toggleCategorie(cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <select style={inputStyle} value={paiement} onChange={(e) => setPaiement(e.target.value as Paiement)}>
                <option value="Non payé">Non payé</option>
                <option value="Payé">Payé</option>
              </select>

              <select style={inputStyle} value={statut} onChange={(e) => setStatut(e.target.value as Statut)}>
                <option value="En attente">En attente</option>
                <option value="Validé">Validé</option>
                <option value="Refusé">Refusé</option>
              </select>

              <button style={buttonStyle} onClick={ajouterInscription}>
                ✅ Enregistrer rapidement
              </button>

              <button
                onClick={viderFormulaire}
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: "#f8fafc",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Vider
              </button>
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 20,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
            }}
          ><div
  style={{
    marginBottom: 20,
  }}
>
  <h2 style={{ marginTop: 0 }}>📍 Compteur par région</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 12,
    }}
  >
    {regions
  .slice()
  .sort((a, b) => compteurRegions[b] - compteurRegions[a])
  .map((region) => (
      <div
        key={region}
        style={{
          padding: 18,
          minHeight: 150,
          borderRadius: 14,
          background:
  compteurRegions[region] >= 8
    ? "#dcfce7"
    : compteurRegions[region] >= 4
    ? "#fef9c3"
    : "#fee2e2",
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ fontWeight: 700 }}>{region}</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>
          {compteurRegions[region]}
        </div>
        <div
  style={{
    marginTop: 6,
    fontSize: 13,
    fontWeight: 700,
    color:
      compteurRegions[region] >= 8
        ? "#166534"
        : compteurRegions[region] >= 4
        ? "#92400e"
        : "#991b1b",
  }}
>
  {compteurRegions[region] >= 8
    ? "PRÊT"
    : compteurRegions[region] >= 4
    ? "EN COURS"
    : "FAIBLE"}
    <div style={{ fontSize: 14, marginTop: 6, color: "#475569" }}>
  {compteurRegions[region] >= 16
    ? "Format : 4 poules"
    : compteurRegions[region] >= 12
    ? "Format : 3 poules"
    : compteurRegions[region] >= 8
    ? "Format : 2 poules"
    : "Format : attente"}
</div>
</div>
      </div>
    ))}
  </div>
</div>
<div style={{ marginTop: 24, marginBottom: 20 }}>
  <h2 style={{ marginTop: 0 }}>🏘️ Compteur par district</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 12,
    }}
  >
    {Object.entries(compteurDistricts)
      .sort((a, b) => b[1] - a[1])
      .map(([district, total]) => (
        <div
          key={district}
          style={{
            padding: 14,
            borderRadius: 14,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontWeight: 700 }}>{district}</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{total}</div>
        </div>
      ))}
  </div>
</div>
            <h2 style={{ marginTop: 0 }}>📋 Inscriptions enregistrées</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <input style={inputStyle} value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher club / tél." />

              <select style={inputStyle} value={filtreRegion} onChange={(e) => setFiltreRegion(e.target.value)}>
                <option value="Toutes">Toutes zones</option>
                {regions.map((r) => <option key={r}>{r}</option>)}
              </select>

              <select style={inputStyle} value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
                <option value="Tous">Tous statuts</option>
                <option value="En attente">En attente</option>
                <option value="Validé">Validé</option>
                <option value="Refusé">Refusé</option>
              </select>

              <select style={inputStyle} value={filtrePaiement} onChange={(e) => setFiltrePaiement(e.target.value)}>
                <option value="Tous">Tous paiements</option>
                <option value="Non payé">Non payé</option>
                <option value="Payé">Payé</option>
              </select>
            </div>

            {inscriptionsFiltrees.length === 0 ? (
              <p>Aucune inscription enregistrée.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {inscriptionsFiltrees.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: 16,
                      background: "#ffffff",
                    }}
                  >
                    <h3 style={{ margin: "0 0 8px" }}>{item.nomClub}</h3>
                    <p style={{ margin: "6px 0" }}>📍 {item.region} / {item.district}</p>
                    <p style={{ margin: "6px 0" }}>🎯 {item.categories.join(", ")}</p>
                    <p style={{ margin: "6px 0" }}>👤 {item.responsable || "-"}</p>
                    <p style={{ margin: "6px 0" }}>📞 {item.telephone || "-"}</p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 10,
                        marginTop: 12,
                      }}
                    >
                      <select style={inputStyle} value={item.paiement} onChange={(e) => changerPaiement(item.id, e.target.value as Paiement)}>
                        <option value="Non payé">Non payé</option>
                        <option value="Payé">Payé</option>
                      </select>

                      <select style={inputStyle} value={item.statut} onChange={(e) => changerStatut(item.id, e.target.value as Statut)}>
                        <option value="En attente">En attente</option>
                        <option value="Validé">Validé</option>
                        <option value="Refusé">Refusé</option>
                      </select>

                      <button style={buttonStyle} onClick={() => validerEtPayer(item)}>
                        ⚡ Valider + Payé
                      </button>

                      <button
                        onClick={() => supprimerInscription(item.id)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 12,
                          border: "1px solid #fecaca",
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
