import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, setLoading, logout } from '../store/slices/authSlice';
import { subscribeToAuthState } from '../services/firebaseAuthService';

export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setLoading(true));

    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthState((user) => {
      if (user) {
        // User is signed in
        const token = user.uid;
        dispatch(setCredentials({ user, token }));
        
        // Persist to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // User is signed out
        dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      dispatch(setLoading(false));
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);
};
