
'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  Firestore,
  getFirestore,
} from 'firebase/firestore';
import { app } from './config';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const { auth, firestore } = useMemo(() => {
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { auth, firestore };
  }, []);

  useEffect(() => {
    const setAuthPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error('Failed to set auth persistence:', error);
      }
    };

    setAuthPersistence();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const value = useMemo(
    () => ({
      app,
      auth,
      firestore,
      user,
      loading,
    }),
    [auth, firestore, user, loading]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useAuth = () => {
    const context = useFirebase();
    return context.auth;
}

export const useFirestore = () => {
    const context = useFirebase();
    return context.firestore;
}

export const useUser = () => {
    const context = useFirebase();
    return { user: context.user, loading: context.loading };
}
