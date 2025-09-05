"use client";
import React, { useEffect } from "react";
import Link from "next/link";

export default function GoogleSuccessPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
    }
  }, []);

  return (
    <div className="oauth-container">
      <main className="oauth-main">
        <h1 className="text-2xl font-semibold tracking-[-.01em]">Google login successful</h1>
        <p className="text-sm/6">You can now navigate the app with your session token stored locally.</p>
        <div className="oauth-actions-row">
          <Link className="oauth-btn" href="/product">Go to Products</Link>
          <Link className="oauth-btn" href="/order">Go to Orders</Link>
          <Link className="oauth-btn" href="/">Home</Link>
        </div>
      </main>
    </div>
  );
}


