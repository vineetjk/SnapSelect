import { useState, useEffect } from 'react';
import { Photographer } from '../types';

export const useAuth = () => {
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const photographerData = localStorage.getItem('photographer');

    if (token && photographerData) {
      setPhotographer(JSON.parse(photographerData));
    }
    setLoading(false);
  }, []);

  const login = (token: string, photographerData: Photographer) => {
    localStorage.setItem('token', token);
    localStorage.setItem('photographer', JSON.stringify(photographerData));
    setPhotographer(photographerData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('photographer');
    setPhotographer(null);
  };

  return { photographer, loading, login, logout };
};
