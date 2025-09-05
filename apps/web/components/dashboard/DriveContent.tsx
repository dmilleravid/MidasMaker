import React from 'react';
import { DriveFolder, DriveParent } from '../../lib/types/dashboard';

interface DriveContentProps {
  folders: DriveFolder[];
  loading: boolean;
  error: string | null;
  currentParent: DriveParent;
  onFolderClick: (folderId: string) => void;
  onBackClick: () => void;
}

export const DriveContent: React.FC<DriveContentProps> = ({
  folders,
  loading,
  error,
  currentParent,
  onFolderClick,
  onBackClick
}) => {
  const totalSize = folders.reduce((total, folder) => total + parseInt(folder.size || '0'), 0);
  const nestedFolders = folders.filter(folder => folder.hasParent).length;

  return (
    <div>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{folders.length}</p>
          <p className="dashboard-stat-label">Folders</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">
            {totalSize.toLocaleString()} bytes
          </p>
          <p className="dashboard-stat-label">Total Size</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{nestedFolders}</p>
          <p className="dashboard-stat-label">Nested Folders</p>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="flex items-center gap-4 mb-4">
          <h3>📁 Google Drive Folders</h3>
          {currentParent.id !== 'root' && (
            <button 
              onClick={onBackClick}
              className="btn btn-secondary text-sm"
              disabled={loading}
            >
              ← Back to {currentParent.parents.length > 0 ? 'Parent' : 'My Drive'}
            </button>
          )}
        </div>
        
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Current location:</span> {currentParent.name}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading Drive folders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <p className="text-sm text-gray-500">Switch tabs to retry</p>
          </div>
        ) : folders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="text-left">
                    Folder Name
                    <span className="ml-1 text-xs text-gray-500">↑</span>
                  </th>
                  <th className="text-left">Owner</th>
                  <th className="text-right">Size</th>
                  <th className="text-right">Created</th>
                  <th className="text-right">Modified</th>
                </tr>
              </thead>
              <tbody>
                {folders.map((folder) => (
                  <tr key={folder.id}>
                    <td className="font-medium">
                      <button
                        onClick={() => onFolderClick(folder.id)}
                        className="text-left hover:text-blue-600 hover:underline flex items-center gap-2"
                        disabled={loading}
                      >
                        📁 {folder.name}
                        <span className="text-xs text-gray-400">→</span>
                      </button>
                    </td>
                    <td>{folder.owner}</td>
                    <td className="text-right">
                      {parseInt(folder.size || '0').toLocaleString()} bytes
                    </td>
                    <td className="text-right">
                      {new Date(folder.createdTime).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {new Date(folder.modifiedTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No Google Drive folders found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Make sure you have folders in your Google Drive account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
