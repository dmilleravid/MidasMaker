import React from 'react';
import { GmailLabel } from '../../lib/types/dashboard';

interface GmailContentProps {
  labels: GmailLabel[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const GmailContent: React.FC<GmailContentProps> = ({
  labels,
  loading,
  error,
  onRefresh
}) => {
  const totalUnread = labels.reduce((sum, label) => sum + label.messagesUnread, 0);
  const totalMessages = labels.reduce((sum, label) => sum + label.messagesTotal, 0);

  return (
    <div>
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{totalUnread}</p>
          <p className="dashboard-stat-label">Unread Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{totalMessages}</p>
          <p className="dashboard-stat-label">Total Emails</p>
        </div>
        <div className="dashboard-stat">
          <p className="dashboard-stat-value">{labels.length}</p>
          <p className="dashboard-stat-label">Labels</p>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="flex justify-between items-center mb-4">
          <h3>📧 Gmail Labels</h3>
          <button 
            onClick={onRefresh} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
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
            <button onClick={onRefresh} className="btn btn-primary">
              Try Again
            </button>
          </div>
        ) : labels.length > 0 ? (
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
                {labels.map((label) => (
                  <tr key={label.id}>
                    <td className="font-medium">{label.name}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs ${
                        label.type === 'system' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
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
