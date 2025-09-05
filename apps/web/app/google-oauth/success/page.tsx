"use client";
import React, { useEffect } from "react";

export default function GoogleSuccessPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Google login successful</h1>
      <p>You can now navigate the app with your session token stored locally.</p>
    </div>
  );
}


