import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, setLoading, logout } from '../store/slices/authSlice';
import { subscribeToAuthState } from '../services/firebaseAuthService';

const normalizeUser = (user) => {
  if (!user) return null;
  const normalize = (value) => {
    if (!value) return value;
    if (typeof value.toDate === 'function') return value.toDate().toISOString();
    if (typeof value === 'object' && value.seconds != null && value.nanoseconds != null) {
      return new Date(value.seconds * 1000 + value.nanoseconds / 1e6).toISOString();
    }
    return value;
  };
  return {
    ...user,
    createdAt: normalize(user.createdAt),
    updatedAt: normalize(user.updatedAt),
  };
};

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
        const normalizedUser = normalizeUser(parsedUser);
        dispatch(setCredentials({ user: normalizedUser, token: storedToken }));
      } catch {
        // Corrupted storage — ignore and let Firebase resolve normally
      }
    }

    dispatch(setLoading(true));

    // ── Subscribe to Firebase auth state changes (authoritative source) ──
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        const token = user.uid;
        const normalizedUser = normalizeUser(user);
        dispatch(setCredentials({ user: normalizedUser, token }));

        // Keep localStorage in sync with the latest Firestore data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
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
