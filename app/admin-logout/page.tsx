"use client"

import { useEffect, useState } from "react"

export default function AdminLogoutPage() {
  const [message, setMessage] = useState("Déconnexion en cours...")

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/admin-logout", {
          method: "POST",
        })

        setMessage("Déconnexion réussie. Redirection...")
        setTimeout(() => {
          window.location.href = "/admin-login"
        }, 800)
      } catch (error) {
        console.error(error)
        setMessage("Erreur pendant la déconnexion.")
      }
    }

    logout()
  }, [])

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 12,
          width: 360,
          boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Déconnexion admin</h2>
        <p>{message}</p>

        <div style={{ marginTop: 20 }}>
          <a
            href="/admin-login"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              background: "#111827",
              color: "white",
              textDecoration: "none",
              borderRadius: 8,
            }}
          >
            Retour au login
          </a>
        </div>
      </div>
    </main>
  )
}