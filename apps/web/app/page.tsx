"use client";
import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive'>('gmail');
  const [userName, setUserName] = useState<string>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('auth_token') || document.cookie
          .split('; ')
          .find(row => row.startsWith('auth_token='))
          ?.split('=')[1];
        
        if (!token) {
          window.location.href = '/auth/login';
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name || userData.email || 'User');
        } else {
          // Token might be invalid, redirect to login
          window.location.href = '/auth/login';
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        window.location.href = '/auth/login';
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    // Clear local storage and cookies
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login page
    window.location.href = '/auth/login';
  };

  const GmailContent = () => (
    <div>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0</p>
          <p className="dashboard-stat-label">Unread Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0</p>
          <p className="dashboard-stat-label">Total Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0</p>
          <p className="dashboard-stat-label">Sent Today</p>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h3>📧 Recent Emails</h3>
        <p>Connect your Gmail account to view your emails and manage your inbox.</p>
      </div>
      
      <div className="dashboard-card">
        <h3>🔍 Email Search</h3>
        <p>Search through your Gmail messages with advanced filters and keywords.</p>
      </div>
      
      <div className="dashboard-card">
        <h3>📊 Email Analytics</h3>
        <p>View insights about your email activity, response times, and communication patterns.</p>
      </div>
    </div>
  );

  const DriveContent = () => (
    <div>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0</p>
          <p className="dashboard-stat-label">Files</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0 GB</p>
          <p className="dashboard-stat-label">Storage Used</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">0</p>
          <p className="dashboard-stat-label">Shared Files</p>
        </div>
      </div>
      
      <div className="dashboard-card">
        <h3>📁 Recent Files</h3>
        <p>Access your most recently opened Google Drive files and folders.</p>
      </div>
      
      <div className="dashboard-card">
        <h3>🔍 File Search</h3>
        <p>Search through your Google Drive files with powerful search capabilities.</p>
      </div>
      
      <div className="dashboard-card">
        <h3>📈 Storage Overview</h3>
        <p>Monitor your Google Drive storage usage and manage your files efficiently.</p>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">MidasMaker Dashboard</h1>
          <p className="dashboard-subtitle">Manage your Gmail and Google Drive integration</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="dashboard-subtitle">{userName}</p>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === 'gmail' ? 'active' : ''}`}
            onClick={() => setActiveTab('gmail')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.27h.909c.904 0 1.636.732 1.636 1.636z"/>
            </svg>
            Gmail
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'drive' ? 'active' : ''}`}
            onClick={() => setActiveTab('drive')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.71 6.705L0 19.295h24L16.29 6.705H7.71zM12 11.295L16.29 18.705H7.71L12 11.295z"/>
            </svg>
            Google Drive
          </button>
        </div>
        
        <div className="dashboard-tab-content">
          {activeTab === 'gmail' ? <GmailContent /> : <DriveContent />}
        </div>
      </div>
    </div>
  );
}
