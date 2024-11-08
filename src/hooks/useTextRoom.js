// src/hooks/useTextRoom.js
import { useState, useEffect } from 'react';
import { ref, onValue, set, get } from 'firebase/database';
import { db } from '../config/firebase';

const useTextRoom = (roomId) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkRoom = async () => {
      try {
        const roomRef = ref(db, `rooms/${roomId}`);
        const snapshot = await get(roomRef);
        
        if (!snapshot.exists()) {
          // Create new room if it doesn't exist
          await set(roomRef, {
            text: '',
            created: Date.now(),
            lastUpdated: Date.now(),
            isLocked: false,
            password: null
          });
          setIsLocked(false);
          setIsAuthenticated(true);
        } else {
          // Check if room is password protected
          const roomData = snapshot.val();
          setIsLocked(roomData.isLocked);
          setIsAuthenticated(!roomData.isLocked);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    checkRoom();
  }, [roomId]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setText(data.text || '');
      }
    }, (err) => {
      setError(err.message);
    });

    return () => unsubscribe();
  }, [roomId, isAuthenticated]);

  const updateText = async (newText) => {
    if (!isAuthenticated) return;
    
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      await set(roomRef, {
        text: newText,
        lastUpdated: Date.now(),
        isLocked: isLocked,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const setPassword = async (password) => {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      await set(roomRef, {
        text: text,
        lastUpdated: Date.now(),
        isLocked: true,
        password: password // In production, you should hash this password
      });
      setIsLocked(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const checkPassword = async (password) => {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        if (roomData.password === password) { // In production, compare hashed passwords
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

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