import React from 'react';
import { GmailLabel } from '../../lib/types/dashboard';

interface GmailContentProps {
  labels: GmailLabel[];
  loading: boolean;
  error: string | null;
  selectedFolders: Set<string>;
  monitorLoading: boolean;
  onToggleFolder: (folderId: string) => void;
  onSaveMonitored: () => void;
}

export const GmailContent: React.FC<GmailContentProps> = ({
  labels,
  loading,
  error,
  selectedFolders,
  monitorLoading,
  onToggleFolder,
  onSaveMonitored
}) => {
  const totalUnread = labels.reduce((sum, label) => sum + label.messagesUnread, 0);
  const totalMessages = labels.reduce((sum, label) => sum + label.messagesTotal, 0);

  return (
    <div>
      
      <div className="dashboard-card">
        <div className="flex items-center mb-4 gap-2">
          <h3 className="flex-1">📧 Gmail Labels</h3>
          <button 
            onClick={onSaveMonitored}
            className="bg-blue-600 text-white text-base font-bold px-5 py-2.5 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={monitorLoading}
          >
            {monitorLoading ? 'Saving...' : 'Monitor'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading Gmail labels...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <p className="text-sm text-gray-500">Switch tabs to retry</p>
          </div>
        ) : labels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="w-12">Select</th>
                  <th className="text-left">
                    Folder Name
                    <span className="ml-1 text-xs text-gray-500">↑</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label.id}>
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedFolders.has(label.id)}
                        onChange={() => onToggleFolder(label.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </td>
                    <td className="font-medium">{label.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No Gmail labels found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Make sure you have connected your Gmail account and have labels set up.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
