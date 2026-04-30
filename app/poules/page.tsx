import { supabase } from "@/lib/supabase";

export default async function PoulesPage() {
  const { data: equipes, error } = await supabase
    .from("qualifies")
    .select("*")
    .order("poule", { ascending: true })
    .order("equipe", { ascending: true });

  if (error) {
    return <main style={{ padding: 30 }}>Erreur chargement poules</main>;
  }

  const poules = (equipes || []).reduce((acc: any, equipe: any) => {
    const nomPoule = equipe.poule || "Sans poule";

    if (!acc[nomPoule]) {
      acc[nomPoule] = [];
    }

    acc[nomPoule].push(equipe);
    return acc;
  }, {});

  return (
    <main style={{ padding: 30 }}>
      <h1>🏆 Poules</h1>
      <p>Répartition des équipes qualifiées par poule.</p>

      {Object.keys(poules).length === 0 ? (
        <p>Aucune équipe dans les poules.</p>
      ) : (
        Object.keys(poules).map((poule) => (
          <section
            key={poule}
            style={{
              marginTop: 25,
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 12,
              background: "white",
            }}
          >
            <h2>Poule {poule}</h2>

            {poules[poule].map((equipe: any) => (
              <div
                key={equipe.id}
                style={{
                  padding: 12,
                  marginTop: 10,
                  border: "1px solid #eee",
                  borderRadius: 10,
                }}
              >
                <strong>{equipe.equipe}</strong>
                <br />
                Catégorie : {equipe.categorie}
                <br />
                District : {equipe.zone}
                <br />
                Région : {equipe.region}
              </div>
            ))}
          </section>
        ))
      )}
    </main>
  );
}