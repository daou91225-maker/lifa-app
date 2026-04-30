"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Equipe = {
  id: string;
  nom: string;
  categorie: string;
  district: string;
  region: string;
  zone: string;
};

export default function ClubsPage() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  const chargerEquipes = async () => {
    const { data, error } = await supabase
      .from("equipes")
      .select("*")
      .order("nom", { ascending: true });

    if (error) {
      console.error("Erreur chargement équipes :", error);
      alert("Erreur chargement des équipes.");
      return;
    }

    setEquipes((data || []) as Equipe[]);
  };

  useEffect(() => {
    chargerEquipes();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>⚽ Clubs engagés</h1>

      <p style={{ marginBottom: 20 }}>
        Clubs issus des inscriptions validées + payées
      </p>

      {equipes.length === 0 && <p>Aucun club validé pour le moment.</p>}

      {equipes.map((club) => (
        <div
          key={club.id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            background: "white",
          }}
        >
          <h3>{club.nom}</h3>
          <p>🎯 Catégorie : {club.categorie || "-"}</p>
          <p>📍 District : {club.district || "-"}</p>
          <p>🌍 Région : {club.region || "-"}</p>
        </div>
      ))}
    </main>
  );
}