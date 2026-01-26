import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, setLoading } from '../store/slices/authSlice';

export const useAuthPersistence = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = () => {
      dispatch(setLoading(true));
      
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          dispatch(setCredentials({ user, token }));
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);
};
