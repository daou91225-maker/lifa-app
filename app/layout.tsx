export const metadata = {
  title: "LIFA APP",
  description: "Compétitions jeunes",
}

const publicLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  padding: "8px 11px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  fontWeight: 700,
  fontSize: 14,
  whiteSpace: "nowrap",
}

const adminStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 999,
  background: "#dc2626",
  fontWeight: "bold",
  fontSize: 14,
  whiteSpace: "nowrap",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f4f6f9",
          margin: 0,
        }}
      >
        <header
          style={{
            background: "#111827",
            color: "white",
            padding: "12px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div
            style={{
              maxWidth: 1300,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <a
              href="/"
              style={{
                color: "white",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              ⚽ LIFA APP
            </a>

            <nav
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <a href="/" style={publicLinkStyle}>Accueil</a>
              <a href="/clubs" style={publicLinkStyle}>Clubs</a>
              <a href="/calendrier" style={publicLinkStyle}>Calendrier</a>
              <a href="/classements" style={publicLinkStyle}>Classements</a>

              <a href="/district" style={publicLinkStyle}>District</a>
              <a href="/regions" style={publicLinkStyle}>Régions</a>
              <a href="/national" style={publicLinkStyle}>National</a>
            </nav>
          </div>
        </header>

        <main style={{ padding: "12px" }}>{children}</main>
      </body>
    </html>
  )
}