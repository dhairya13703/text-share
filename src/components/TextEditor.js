import React, { useState, useEffect } from 'react';
import { Share2, Lock, Unlock, Check, Copy } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import useTextRoom from '../hooks/useTextRoom';

const TextEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [password, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLocalText(text);
    updateCounts(text);
  }, [text]);

  const updateCounts = (text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setLocalText(newText);
    updateCounts(newText);
    
    const timeoutId = setTimeout(() => {
      updateText(newText);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSetPassword = async () => {
    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }
    await setPassword(password);
    setShowPasswordModal(false);
    setPasswordInput('');
  };

  const handleCheckPassword = async () => {
    const isCorrect = await checkPassword(password);
    if (isCorrect) {
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      setErrorMessage('Incorrect password');
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

  // Password Modal Component
  const PasswordModal = ({ isSettingPassword = false }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">
          {isSettingPassword ? 'Set Password' : 'Enter Password'}
        </h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder={isSettingPassword ? 'Create password' : 'Enter password'}
          className="w-full p-2 border rounded mb-4"
        />
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordInput('');
              setErrorMessage('');
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={isSettingPassword ? handleSetPassword : handleCheckPassword}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isSettingPassword ? 'Set Password' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );

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
          {showPasswordModal && <PasswordModal />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-header-bg text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
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
      <main className="max-w-5xl mx-auto p-4">
        <div className="editor-container">
          <textarea
            value={localText}
            onChange={handleTextChange}
            placeholder="Enter your text here"
            className="editor-textarea"
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

      {showPasswordModal && <PasswordModal isSettingPassword={!isLocked} />}
    </div>
  );
};

export default TextEditor;