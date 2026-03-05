import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, setLoading, logout } from '../store/slices/authSlice';
import { subscribeToAuthState } from '../services/firebaseAuthService';

export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // ── Pre-hydrate from localStorage so the UI renders immediately on refresh
    // rather than waiting for Firebase to re-resolve (avoids role flicker).
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setCredentials({ user: parsedUser, token: storedToken }));
      } catch {
        // Corrupted storage — ignore and let Firebase resolve normally
      }
    }

    dispatch(setLoading(true));

    // ── Subscribe to Firebase auth state changes (authoritative source) ──
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        const token = user.uid;
        dispatch(setCredentials({ user, token }));

        // Keep localStorage in sync with the latest Firestore data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, [dispatch]);
};
