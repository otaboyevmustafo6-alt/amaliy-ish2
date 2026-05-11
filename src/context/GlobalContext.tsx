import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Board, Column, Task } from '../types';

interface GlobalState {
  boards: Board[];
  currentBoard: Board | null;
  columns: Column[];
  tasks: Task[];
  loading: boolean;
}

type GlobalAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'SET_CURRENT_BOARD'; payload: Board | null }
  | { type: 'SET_COLUMNS'; payload: Column[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: GlobalState = {
  boards: [],
  currentBoard: null,
  columns: [],
  tasks: [],
  loading: false,
};

function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    case 'SET_BOARDS':
      return { ...state, boards: action.payload };
    case 'SET_CURRENT_BOARD':
      return { ...state, currentBoard: action.payload };
    case 'SET_COLUMNS':
      return { ...state, columns: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
} | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
}
