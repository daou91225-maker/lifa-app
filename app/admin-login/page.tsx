"use client"

import { useState } from "react"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (password === "lifa2025") {
      document.cookie = "admin-token=lifa-secure-2025; path=/"
      window.location.href = "/admin-zone"
    } else {
      alert("Mot de passe incorrect")
    }
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          padding: 30,
          border: "1px solid #ccc",
          borderRadius: 10,
          width: 320,
          background: "white",
        }}
      >
        <h2>Connexion admin</h2>

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginTop: 10,
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: 15,
            padding: 10,
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Se connecter
        </button>
      </form>
    </main>
  )
}