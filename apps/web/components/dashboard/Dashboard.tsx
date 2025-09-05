import React, { useState } from 'react';
import { useDashboard } from '../../lib/hooks/useDashboard';
import { GmailContent } from './GmailContent';
import { DriveContent } from './DriveContent';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'drive'>('gmail');
  
  const {
    userName,
    gmailLabels,
    gmailLoading,
    gmailError,
    selectedFolders,
    monitorLoading,
    driveFolders,
    driveLoading,
    driveError,
    currentDriveParent,
    fetchGmailLabels,
    fetchDriveFolders,
    handleLogout,
    handleFolderClick,
    handleBackClick,
    toggleFolderSelection,
    saveMonitoredFolders
  } = useDashboard();

  const handleTabChange = (tab: 'gmail' | 'drive') => {
    setActiveTab(tab);
    if (tab === 'gmail' && !gmailLoading) {
      fetchGmailLabels();
    } else if (tab === 'drive' && !driveLoading) {
      fetchDriveFolders();
    }
  };

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
            📧 Gmail
          </button>
          <button
            className={`dashboard-tab ${activeTab === 'drive' ? 'active' : ''}`}
            onClick={() => handleTabChange('drive')}
          >
            📁 Google Drive
          </button>
        </div>

        <div className="dashboard-tab-content">
          {activeTab === 'gmail' ? (
            <GmailContent
              labels={gmailLabels}
              loading={gmailLoading}
              error={gmailError}
              selectedFolders={selectedFolders}
              monitorLoading={monitorLoading}
              onToggleFolder={toggleFolderSelection}
              onSaveMonitored={saveMonitoredFolders}
            />
          ) : (
            <DriveContent
              folders={driveFolders}
              loading={driveLoading}
              error={driveError}
              currentParent={currentDriveParent}
              onFolderClick={handleFolderClick}
              onBackClick={handleBackClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};
