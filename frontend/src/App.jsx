import React, { useEffect, useState } from "react";
import UploadForm from "./components/UploadForm";
import DocumentsList from "./components/Documents";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [docs, setDocs] = useState([]);
  const [message, setMessage] = useState("");

  const fetchDocs = async () => {
    try {
      const res = await fetch(`${API}/documents`);
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      setMessage("Failed to load documents");
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const onUploadSuccess = (msg) => {
    setMessage(msg);
    fetchDocs();
  };

  const onDelete = async (id) => {
    try {
      const res = await fetch(`${API}/documents/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage("Document deleted");
        fetchDocs();
      } else {
        setMessage("Failed to delete");
      }
    } catch (err) {
      setMessage("Failed to delete");
    }
  };

  return (
    <div className="container">
      <h1>Patient Document Portal</h1>

      {message && <div className="message">{message}</div>}

      <UploadForm
        apiUrl={API}
        onSuccess={onUploadSuccess}
        setMessage={setMessage}
      />

      <hr />

      <DocumentsList docs={docs} apiUrl={API} onDelete={onDelete} />
    </div>
  );
}
