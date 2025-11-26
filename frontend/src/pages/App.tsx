import { useState } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: Date;
}

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() || content.trim()) {
      const newNote: Note = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        created_at: new Date(),
      };
      try {
        const res: AxiosResponse = await axios.post(
          "http://127.0.0.1:5000/notes",
          newNote,
          { headers: { "Content-Type": "application/json" } }
        );
        const data = res.data;
        console.log(data);
      } catch (error) {
        console.log("Error submitting to DB");
      }
      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
    }
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter((note) => note.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleSaveEdit = (id: number) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? { ...note, title: editTitle.trim(), content: editContent.trim() }
          : note
      )
    );
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Notes Playground
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create, edit, and manage notes
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Add New Note
          </h2>
          <form onSubmit={handleAddNote}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Note content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Add Note
            </button>
          </form>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              No notes yet. Create your first note above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 flex flex-col"
              >
                {editingId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 font-semibold"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 mb-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 resize-none grow"
                    />
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 bg-slate-400 hover:bg-slate-500 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {note.title && (
                      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
                        {note.title}
                      </h3>
                    )}
                    <p className="text-slate-600 dark:text-slate-300 mb-4 grow whitespace-pre-wrap">
                      {note.content || (
                        <span className="text-slate-400 italic">
                          No content
                        </span>
                      )}
                    </p>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      {formatDate(note.created_at)}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleStartEdit(note)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
