import {createContext} from '@lit/context';
import { User } from '../api/types';

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  setAuth: (auth: Partial<AuthContext>) => void;
}

export const authContext = createContext<AuthContext>('auth-context');