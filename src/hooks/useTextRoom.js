// src/hooks/useTextRoom.js
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from '../config/firebase';

const useTextRoom = (documentId) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const documentRef = ref(db, `documents/${documentId}`);
    
    // Initial check and setup
    const initializeDocument = async () => {
      try {
        const snapshot = await get(documentRef);
        
        if (!snapshot.exists()) {
          // Create new document if it doesn't exist
          await set(documentRef, {
            text: '',
            created: Date.now(),
            lastUpdated: Date.now(),
            isLocked: false
          });
          setIsLocked(false);
          setIsAuthenticated(true);
        } else {
          const docData = snapshot.val();
          setIsLocked(!!docData.isLocked);
          setIsAuthenticated(!docData.isLocked);
          setText(docData.text || '');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error initializing document:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Set up real-time listener
    const unsubscribe = onValue(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setText(data.text || '');
        setIsLocked(!!data.isLocked);
      }
    }, (err) => {
      console.error('Error in real-time listener:', err);
      setError(err.message);
    });

    initializeDocument();

    // Cleanup
    return () => unsubscribe();
  }, [documentId]);

  const updateText = useCallback(async (newText) => {
    if (!documentId || (!isAuthenticated && isLocked)) return;

    try {
      const documentRef = ref(db, `documents/${documentId}`);
      const snapshot = await get(documentRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};
      
      await set(documentRef, {
        ...currentData,
        text: newText,
        lastUpdated: Date.now()
      });
    } catch (err) {
      console.error('Error updating text:', err);
      setError(err.message);
    }
  }, [documentId, isAuthenticated, isLocked]);

  const setPassword = useCallback(async (password) => {
    if (!documentId) return;

    try {
      const documentRef = ref(db, `documents/${documentId}`);
      const snapshot = await get(documentRef);
      const currentData = snapshot.exists() ? snapshot.val() : {};

      await set(documentRef, {
        ...currentData,
        isLocked: true,
        password: password, // In production, hash this password
        lastUpdated: Date.now()
      });
      setIsLocked(true);
    } catch (err) {
      console.error('Error setting password:', err);
      setError(err.message);
    }
  }, [documentId]);

  const checkPassword = useCallback(async (password) => {
    if (!documentId) return false;

    try {
      const documentRef = ref(db, `documents/${documentId}`);
      const snapshot = await get(documentRef);
      
      if (snapshot.exists()) {
        const docData = snapshot.val();
        if (docData.password === password) { // In production, compare hashed passwords
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error checking password:', err);
      setError(err.message);
      return false;
    }
  }, [documentId]);

  return {
    text,
    loading,
    error,
    isLocked,
    isAuthenticated,
    updateText,
    setPassword,
    checkPassword
  };
};

export default useTextRoom;