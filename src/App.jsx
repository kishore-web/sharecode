import "./App.css";
import "tailwindcss";

import { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
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
    if (!text.trim()) return alert("Please enter some text");

    const now = new Date();
    const expiryTime = {
      "1d": 86400000,
      "1w": 7 * 86400000,
      "1m": 30 * 86400000,
    }[expire];

    try {
      // ✅ Use Firebase auto ID
      const docRef = await addDoc(collection(db, "notes"), {
        text,
        createdAt: now.getTime(),
        expiresAt: now.getTime() + expiryTime,
      });

      // ✅ Use Firebase-generated ID in share link
      setShareLink(`${window.location.origin}/note/${docRef.id}`);
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Something went wrong while saving your note!");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">ShareText Clone</h1>

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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Share Link
        </button>
      </div>

      {shareLink && (
        <div className="mt-4 bg-gray-100 p-3 rounded">
          <p className="font-medium">✅ Your Share Link:</p>
          <a
            href={shareLink}
            className="text-blue-600 underline break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}

function ViewNote() {
  const { id } = useParams();
  const [note, setNote] = useState("Loading note...");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const noteRef = doc(db, "notes", id);
        const docSnap = await getDoc(noteRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const now = Date.now();
          if (now > data.expiresAt) {
            setNote("❌ Note Expired!");
          } else {
            setNote(data.text);
          }
        } else {
          setNote("❌ Note not found!");
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setNote("⚠️ Error loading note.");
      }
    };

    fetchNote();
  }, [id]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">View Note</h1>
      <p className="whitespace-pre-wrap border p-3 rounded bg-gray-50">
        {note}
      </p>
      <Link to="/" className="text-blue-600 mt-4 block text-center">
        ⬅️ Create New Note
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
