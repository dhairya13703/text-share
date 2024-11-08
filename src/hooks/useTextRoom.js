// src/hooks/useTextRoom.js
import { useState, useEffect } from 'react';
import { ref, onValue, set, off } from 'firebase/database';
import { db } from '../config/firebase';

const useTextRoom = (roomId) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);

    const handleData = (snapshot) => {
      setLoading(false);
      const data = snapshot.val();
      if (data) {
        setText(data.text || '');
      } else {
        // Initialize room if it doesn't exist
        set(roomRef, { text: '', lastUpdated: Date.now() })
          .catch(err => setError(err.message));
      }
    };

    const handleError = (err) => {
      setLoading(false);
      setError(err.message);
    };

    // Subscribe to changes
    onValue(roomRef, handleData, handleError);

    // Cleanup subscription
    return () => off(roomRef);
  }, [roomId]);

  const updateText = async (newText) => {
    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      await set(roomRef, {
        text: newText,
        lastUpdated: Date.now()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return { text, setText, updateText, loading, error };
};

export default useTextRoom;