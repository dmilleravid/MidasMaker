"use client";
import React from "react";

export default function GoogleLoginPage() {
  const handleLogin = () => {
    // Redirect to API start endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/google/start`;
  };

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Sign in with Google</h1>
      <button onClick={handleLogin} style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: 6 }}>
        Continue with Google
      </button>
    </div>
  );
}


