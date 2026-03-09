import {createContext} from '@lit/context';

export interface AuthContext {
  isAuthenticated: boolean;
  token: string | null;
}

export const authContext = createContext<AuthContext>('auth-context');