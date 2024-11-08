// src/components/TextEditor.js
import React, { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';
import useTextRoom from '../hooks/useTextRoom';
import LoadingSpinner from './LoadingSpinner';

const TextEditor = ({ roomId }) => {
  const { text, updateText, loading, error } = useTextRoom(roomId);
  const [localText, setLocalText] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastTyped, setLastTyped] = useState(null);

  // Update local text when room text changes
  useEffect(() => {
    if (text && !lastTyped) {
      setLocalText(text);
    }
  }, [text, lastTyped]);

  // Handle text changes with debouncing
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setLocalText(newText);
    setLastTyped(Date.now());

    // Debounce updates to Firebase
    const timeoutId = setTimeout(() => {
      updateText(newText);
      setLastTyped(null);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Shared Text Editor</h1>
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        <textarea
          value={localText}
          onChange={handleTextChange}
          placeholder="Start typing here... Your text will be shared in real-time!"
          className="w-full h-96 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="mt-4 text-sm text-gray-500">
          Room ID: {roomId} • Characters: {localText.length}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;