// You can create this as a separate component: src/components/PasswordModal.js
import React, { useState, useRef, useEffect } from 'react';

const PasswordModal = ({ 
  isSettingPassword = false, 
  onSubmit, 
  onCancel,
  initialError = ''
}) => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(initialError);
  const inputRef = useRef(null);

  // Auto-focus the input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission from refreshing the page

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    setErrorMessage('');
    onSubmit(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={e => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">
          {isSettingPassword ? 'Set Password' : 'Enter Password'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSettingPassword ? 'Create password' : 'Enter password'}
            className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoComplete={isSettingPassword ? 'new-password' : 'current-password'}
          />
          
          {errorMessage && (
            <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isSettingPassword ? 'Set Password' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;