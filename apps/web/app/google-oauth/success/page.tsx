"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function GoogleSuccessPage() {
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const next = url.searchParams.get("next");
    
    if (token) {
      localStorage.setItem("auth_token", token);
      document.cookie = `auth_token=${token}; path=/`;
      
      // Auto-redirect after a short delay
      setTimeout(() => {
        setRedirecting(true);
        window.location.href = next || "/";
      }, 2000);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">🎉 Login Successful!</h2>
        
        <div className="success">
          You have successfully signed in with Google. Your session is now active.
        </div>
        
        {redirecting ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">Redirecting you now...</p>
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <Link href="/product" className="btn btn-primary">
              Go to Products
            </Link>
            <Link href="/order" className="btn btn-secondary">
              Go to Orders
            </Link>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


