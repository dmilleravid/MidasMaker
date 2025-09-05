"use client";
import React, { useState, useEffect } from "react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive'>('gmail');
  const [userName, setUserName] = useState<string>('User');
  const [gmailLabels, setGmailLabels] = useState<Array<{
    id: string;
    name: string;
    type: string;
    messagesTotal: number;
    messagesUnread: number;
    threadsTotal: number;
    threadsUnread: number;
  }>>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

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
        // User info loaded
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

  const fetchGmailLabels = async () => {
    setGmailLoading(true);
    setGmailError(null);
    
    try {
      const token = localStorage.getItem('auth_token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      if (!token) {
        setGmailError('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/gmail/labels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Gmail labels');
      }

      const data = await response.json();
      // Filter out system labels except "Inbox"
      const filteredLabels = (data.labels || []).filter((label: { name: string; type: string }) => {
        // Keep Inbox and all user-created labels
        return label.name === 'INBOX' || label.type === 'user';
      });
      // Sort labels alphabetically by name (ascending)
      const sortedLabels = filteredLabels.sort((a: { name: string }, b: { name: string }) => 
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
      setGmailLabels(sortedLabels);
    } catch (error) {
      console.error('Error fetching Gmail labels:', error);
      setGmailError(error instanceof Error ? error.message : 'Failed to fetch Gmail labels');
    } finally {
      setGmailLoading(false);
    }
  };

  const handleTabChange = (tab: 'gmail' | 'drive') => {
    setActiveTab(tab);
    if (tab === 'gmail' && gmailLabels.length === 0 && !gmailLoading) {
      fetchGmailLabels();
    }
  };

  const GmailContent = () => (
    <div>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">
            {gmailLabels.reduce((sum, label) => sum + (label.messagesUnread || 0), 0)}
          </p>
          <p className="dashboard-stat-label">Unread Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">
            {gmailLabels.reduce((sum, label) => sum + (label.messagesTotal || 0), 0)}
          </p>
          <p className="dashboard-stat-label">Total Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{gmailLabels.length}</p>
          <p className="dashboard-stat-label">Labels</p>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-4">
          <h3>📧 Gmail Labels</h3>
          <button 
            onClick={fetchGmailLabels} 
            disabled={gmailLoading}
            className="btn btn-secondary"
          >
            {gmailLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {gmailError && (
          <div className="error mb-4">
            {gmailError}
          </div>
        )}
        
        {gmailLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading Gmail labels...</p>
          </div>
        ) : gmailLabels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="text-left">
                    Label Name
                    <span className="ml-1 text-xs text-gray-500">↑</span>
                  </th>
                  <th className="text-left">Type</th>
                  <th className="text-right">Total Messages</th>
                </tr>
              </thead>
              <tbody>
                {gmailLabels.map((label) => (
                  <tr key={label.id}>
                    <td className="font-medium">{label.name}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        label.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {label.type}
                      </span>
                    </td>
                    <td className="text-right">{label.messagesTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon">📧</div>
            <h3>No Gmail Labels Found</h3>
            <p>Click &quot;Refresh&quot; to load your Gmail labels or check your Google account connection.</p>
          </div>
        )}
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
            onClick={() => handleTabChange('gmail')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.91L12 10.09l9.455-6.27h.909c.904 0 1.636.732 1.636 1.636z"/>
            </svg>
            Gmail
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'drive' ? 'active' : ''}`}
            onClick={() => handleTabChange('drive')}
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
