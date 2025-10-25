import "./App.css";
import "tailwindcss";

import { useState } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  Link,
} from "react-router-dom";

function CreateNote() {
  const [text, setText] = useState("");
  const [expire, setExpire] = useState("1d");
  const [shareLink, setShareLink] = useState("");

  const handleSave = async () => {
    if (!text.trim()) return alert("Enter some text");
    const id = uuidv4().slice(0, 8);
    const now = new Date();
    const expiryTime = {
      "1d": 86400000,
      "1w": 7 * 86400000,
      "1m": 30 * 86400000,
    }[expire];

    await addDoc(collection(db, "notes"), {
      id,
      text,
      createdAt: now.getTime(),
      expiresAt: now.getTime() + expiryTime,
    });

    setShareLink(`${window.location.origin}/note/${id}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ShareText Clone</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write or paste your text here..."
        className="w-full h-48 p-2 border rounded"
      />
      <div className="flex justify-between items-center mt-3">
        <select
          value={expire}
          onChange={(e) => setExpire(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="1d">1 Day</option>
          <option value="1w">1 Week</option>
          <option value="1m">1 Month</option>
        </select>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create Share Link
        </button>
      </div>
      {shareLink && (
        <div className="mt-4">
          <p>Your Share Link:</p>
          <a href={shareLink} className="text-blue-600 underline">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}

function ViewNote() {
  const { id } = useParams();
  const [note, setNote] = useState("");

  useState(() => {
    const fetchNote = async () => {
      const notesRef = collection(db, "notes");
      const querySnap = await getDoc(doc(notesRef, id));
      if (querySnap.exists()) {
        const data = querySnap.data();
        const now = Date.now();
        if (now > data.expiresAt) setNote("❌ Note Expired!");
        else setNote(data.text);
      } else setNote("❌ Note not found");
    };
    fetchNote();
  }, [id]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View Note</h1>
      <p className="whitespace-pre-wrap border p-3 rounded">{note}</p>
      <Link to="/" className="text-blue-600 mt-4 block">
        Create New Note
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateNote />} />
        <Route path="/note/:id" element={<ViewNote />} />
      </Routes>
    </Router>
  );
}
