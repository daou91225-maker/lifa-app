export default function Home() {
  const cards = [
    {
      icon: "🏟️",
      title: "Clubs engagés",
      desc: "Consulter les clubs validés et engagés dans les compétitions.",
      link: "/clubs",
      color: "#16a34a",
    },
    {
      icon: "🏆",
      title: "Classements",
      desc: "Suivre les classements par catégorie et par zone.",
      link: "/classements",
      color: "#7c3aed",
    },
    {
      icon: "🥇",
      title: "Phase district",
      desc: "Voir les équipes, matchs et champions de district.",
      link: "/district",
      color: "#dc2626",
    },
    {
      icon: "🌍",
      title: "Phase régionale",
      desc: "Suivre les champions régionaux et les qualifiés.",
      link: "/regions",
      color: "#0891b2",
    },
    
      {
icon: "📅",
title: "Calendrier",
desc: "Consulter les matchs programmés et dates à venir.",
link: "/calendrier",
color: "#2563eb",
},
     {
       icon: "🎖️",
      title: "Phase nationale",
      desc: "Consulter la phase finale nationale et le champion final.",
      link: "/national",
      color: "#111827",
    },
  ]

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#eef2ff 0%, #f8fafc 35%, #ffffff 100%)",
        padding: "14px",
      }}
    >
      <section
        style={{
          maxWidth: 1300,
          margin: "0 auto 24px auto",
          background:
            "linear-gradient(120deg,#f97316 0%, #ffffff 45%, #16a34a 100%)",
          borderRadius: 24,
          padding: "22px",
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.85)",
            padding: "7px 14px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          🇨🇮 Plateforme officielle LIFA
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(30px,7vw,58px)",
            lineHeight: 1.08,
            fontWeight: 900,
            color: "#111827",
          }}
        >
          ⚽ LIFA APP
        </h1>

        <div
          style={{
            fontSize: "clamp(18px,4vw,28px)",
            fontWeight: 800,
            marginTop: 8,
            color: "#1f2937",
          }}
        >
          Compétitions jeunes
        </div>

        <p
          style={{
            marginTop: 16,
            color: "#374151",
            fontSize: 16,
            lineHeight: 1.6,
            maxWidth: 900,
          }}
        >
          Consultez les clubs engagés, les classements, les phases de district,
          les phases régionales et la phase nationale des compétitions jeunes.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {[
            ["🏟️ Structure", "Districts • Régions • National"],
            ["👦 Catégories", "U11 • U13 • U15 • U17"],
            ["👁️ Public", "Consultation uniquement"],
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.84)",
                padding: 14,
                borderRadius: 16,
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                {item[0]}
              </div>
              <div style={{ color: "#4b5563", fontSize: 14 }}>
                {item[1]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        {cards.map((card, i) => (
          <a
            key={i}
            href={card.link}
            style={{
              background: "white",
              borderRadius: 20,
              padding: 18,
              textDecoration: "none",
              color: "#111827",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
              minHeight: 190,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 24,
                  marginBottom: 16,
                }}
              >
                {card.icon}
              </div>

              <h3 style={{ margin: 0, marginBottom: 10, fontSize: 21 }}>
                {card.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  lineHeight: 1.5,
                  fontSize: 14,
                }}
              >
                {card.desc}
              </p>
            </div>

            <div
              style={{
                marginTop: 16,
                color: card.color,
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Consulter →
            </div>
          </a>
        ))}
      </section>

      <footer
        style={{
          textAlign: "center",
          marginTop: 28,
          color: "#6b7280",
          fontSize: 13,
          paddingBottom: 20,
        }}
      >
        LIFA APP • Consultation publique officielle
      </footer>
    </main>
  )
}