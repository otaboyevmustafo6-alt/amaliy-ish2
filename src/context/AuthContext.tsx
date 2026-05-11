import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED' };

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: true };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          dispatch({ type: 'SET_USER', payload: userDoc.data() as User });
        } else {
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: Date.now(),
          };
          await setDoc(userDocRef, newUser);
          dispatch({ type: 'SET_USER', payload: newUser });
        }
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
      dispatch({ type: 'SET_INITIALIZED' });
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
