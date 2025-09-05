import { useState, useEffect, useCallback } from 'react';
import { GmailLabel, DriveFolder, DriveParent, UserInfo } from '../types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const useDashboard = () => {
  const [userName, setUserName] = useState<string>('User');
  const [gmailLabels, setGmailLabels] = useState<GmailLabel[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [currentDriveParent, setCurrentDriveParent] = useState<DriveParent>({ 
    id: 'root', 
    name: 'My Drive', 
    parents: [] 
  });

  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
  };

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData: UserInfo = await response.json();
        setUserName(userData.name || userData.email || 'User');
      } else {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      window.location.href = '/auth/login';
    }
  }, []);

  const fetchGmailLabels = async () => {
    setGmailLoading(true);
    setGmailError(null);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        setGmailError('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/gmail/labels`, {
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

  const fetchDriveFolders = async (parentId: string = currentDriveParent.id) => {
    setDriveLoading(true);
    setDriveError(null);
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        setDriveError('No authentication token found');
        return;
      }

      const url = new URL(`${API_BASE_URL}/api/drive/folders`);
      if (parentId !== 'root') {
        url.searchParams.set('parentId', parentId);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch Drive folders');
      }

      const data = await response.json();
      setDriveFolders(data.folders || []);
      setCurrentDriveParent(data.currentParent || { id: 'root', name: 'My Drive', parents: [] });
    } catch (error) {
      console.error('Error fetching Drive folders:', error);
      setDriveError(error instanceof Error ? error.message : 'Failed to fetch Drive folders');
    } finally {
      setDriveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/auth/login';
  };

  const handleFolderClick = (folderId: string) => {
    fetchDriveFolders(folderId);
  };

  const handleBackClick = () => {
    if (currentDriveParent.id === 'root') {
      return;
    }
    
    const parentId = currentDriveParent.parents.length > 0 ? currentDriveParent.parents[0] : 'root';
    fetchDriveFolders(parentId);
  };

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return {
    userName,
    gmailLabels,
    gmailLoading,
    gmailError,
    driveFolders,
    driveLoading,
    driveError,
    currentDriveParent,
    fetchGmailLabels,
    fetchDriveFolders,
    handleLogout,
    handleFolderClick,
    handleBackClick
  };
};
