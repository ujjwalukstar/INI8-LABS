import React from 'react';

export default function Documents({ docs, apiUrl, onDelete }) {
  if (!docs.length) return <div>No documents uploaded yet</div>;

  return (
    <div>
      <h2>Your Documents</h2>
      <table className="docs-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Size (KB)</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(doc => (
            <tr key={doc.id}>
              <td>{doc.filename}</td>
              <td>{Math.round(doc.filesize / 1024)}</td>
              <td>{new Date(doc.created_at).toLocaleString()}</td>
              <td>
                <a href={`${apiUrl}/documents/${doc.id}`} target="_blank" rel="noreferrer">Download</a>
                {' | '}
                <button onClick={() => onDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
