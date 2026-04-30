"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type MatchItem = {
  id: number;
  equipe1: string;
  equipe2: string;
  score1: number;
  score2: number;
};

export default function MatchsPage() {
  const [matchs, setMatchs] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
  const [inputPassword, setInputPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMatchs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("matchs")
      .select("id, equipe1, equipe2, score1, score2")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erreur chargement matchs :", error);
      setLoading(false);
      return;
    }

    setMatchs(data || []);
    setLoading(false);
  };

  const updateScore = async (
    id: number,
    field: "score1" | "score2",
    value: number
  ) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("matchs")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.error("Erreur update score :", error);
      return;
    }

    setMatchs((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const resetChampionnat = async () => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("matchs")
      .update({ score1: 0, score2: 0 })
      .gte("id", 1);

    if (error) {
      console.error("Erreur reset :", error);
      return;
    }

    fetchMatchs();
    alert("Championnat réinitialisé.");
  };

  useEffect(() => {
    fetchMatchs();
  }, []);

  const handleLogin = () => {
    if (inputPassword === adminPassword) {
      setIsAdmin(true);
    } else {
      alert("Mot de passe incorrect");
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>⚽ Saisie des matchs</h1>

      {!isAdmin ? (
        <div
          style={{
            marginBottom: 20,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 10,
            background: "white",
            maxWidth: 420,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Accès administrateur</h3>

          <input
            type="password"
            placeholder="Mot de passe admin"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Se connecter
          </button>
        </div>
      ) : (
        <button
          onClick={resetChampionnat}
          style={{
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#dc2626",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reset championnat
        </button>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        matchs.map((match) => (
          <div
            key={match.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
              background: "white",
            }}
          >
            <h3>
              {match.equipe1} vs {match.equipe2}
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                value={match.score1}
                disabled={!isAdmin}
                onChange={(e) =>
                  updateScore(match.id, "score1", Number(e.target.value))
                }
                style={{ width: 70, padding: 8 }}
              />

              <span>-</span>

              <input
                type="number"
                value={match.score2}
                disabled={!isAdmin}
                onChange={(e) =>
                  updateScore(match.id, "score2", Number(e.target.value))
                }
                style={{ width: 70, padding: 8 }}
              />
            </div>
          </div>
        ))
      )}
    </main>
  );
}