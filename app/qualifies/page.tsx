"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function QualifiesPage() {
  const [equipes, setEquipes] = useState<any[]>([]);

  const fetchEquipes = async () => {
    const { data, error } = await supabase
      .from("qualifies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEquipes(data);
  };

  useEffect(() => {
    fetchEquipes();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>🏆 Équipes qualifiées</h1>

      {equipes.length === 0 ? (
        <p>Aucune équipe qualifiée.</p>
      ) : (
        equipes.map((team, index) => (
          <div
            key={index}
            style={{
              marginBottom: 10,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "white",
            }}
          >
            <strong>{team.equipe}</strong>  
            <br />
            Catégorie : {team.categorie}  
            <br />
            District : {team.district}  
            <br />
            Région : {team.region}
          </div>
        ))
      )}
    </main>
  );
}