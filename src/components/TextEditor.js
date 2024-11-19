import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Share2, Lock, Unlock, Check } from 'lucide-react';
import { useParams } from 'react-router-dom';
import useTextRoom from '../hooks/useTextRoom';
import PasswordModal from './PasswordModal';

const TextEditor = () => {
  const { id } = useParams();
  const {
    text,
    loading,
    error,
    isLocked,
    isAuthenticated,
    updateText,
    setPassword,
    checkPassword
  } = useTextRoom(id);

  const [localText, setLocalText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Refs for debouncing
  const updateTimeoutRef = useRef(null);

  // Define updateCounts first
  const updateCounts = useCallback((text) => {
    const words = text?.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text?.length || 0);
  }, []);

  // Then use it in handleTextChange
  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    setLocalText(newText);
    updateCounts(newText);

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout for Firebase update
    updateTimeoutRef.current = setTimeout(() => {
      updateText(newText);
    }, 500);
  }, [updateText, updateCounts]);

  // Initialize text and counts when text loads from Firebase
  useEffect(() => {
    if (text !== undefined) {
      setLocalText(text);
      updateCounts(text);
    }
  }, [text, updateCounts]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handlePasswordSubmit = async (password) => {
    try {
      if (isLocked) {
        const isCorrect = await checkPassword(password);
        if (isCorrect) {
          setShowPasswordModal(false);
          setPasswordError('');
        } else {
          setPasswordError('Incorrect password');
        }
      } else {
        await setPassword(password);
        setShowPasswordModal(false);
        setPasswordError('');
      }
    } catch (err) {
      setPasswordError('An error occurred. Please try again.');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background animate-fade-in">
        <div className="max-w-5xl mx-auto p-4">
          <div className="editor-container animate-pulse">
            <div className="h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isLocked && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">This note is password protected</h2>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enter Password
          </button>
          {showPasswordModal && (
            <PasswordModal
              isSettingPassword={false}
              onSubmit={handlePasswordSubmit}
              onCancel={() => {
                setShowPasswordModal(false);
                setPasswordError('');
              }}
              initialError={passwordError}
            />
          )}
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-[#1a1a1a] text-white">
        <div className="px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">NotePage</h1>
          <div className="flex gap-2">
            <button
              onClick={copyShareLink}
              className="icon-button"
              title="Share"
            >
              {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => !isLocked && setShowPasswordModal(true)}
              className="icon-button"
              title={isLocked ? "Password Protected" : "Set Password"}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-200px)]">
          <textarea
            value={localText}
            onChange={handleTextChange}
            placeholder="Enter your text here"
            className="w-full h-[calc(100vh-200px)] p-8 text-gray-800 border-0 resize-none 
              focus:ring-0 focus:outline-none placeholder-gray-400"
            spellCheck="true"
          />
        </div>

        {/* Footer */}
        <footer className="mt-4 px-2 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Star ⭐ on Github</span>
            <a 
              href="https://github.com/yourusername/notepage"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              YourUsername
            </a>
          </div>
          <div className="flex items-center gap-4">
            <span>Word Count: {wordCount}</span>
            <span>Character Count: {charCount}</span>
          </div>
        </footer>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          isSettingPassword={!isLocked}
          onSubmit={handlePasswordSubmit}
          onCancel={() => {
            setShowPasswordModal(false);
            setPasswordError('');
          }}
          initialError={passwordError}
        />
      )}
    </div>
  );
};

export default TextEditor;