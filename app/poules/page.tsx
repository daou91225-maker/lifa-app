import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function PoulesPage() {
  const { data } = await supabase
    .from("qualifies")
    .select("*");

  const poules: any = {};

  data?.forEach((team) => {
    if (!poules[team.poule]) {
      poules[team.poule] = [];
    }
    poules[team.poule].push(team);
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>🏆 Poules</h1>

      {Object.keys(poules).map((poule) => (
        <div key={poule} style={{ marginBottom: 20 }}>
          <h2>Poule {poule}</h2>

          {poules[poule].map((team: any) => (
            <div key={team.id}>
              {team.equipe}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}