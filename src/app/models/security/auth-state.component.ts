export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  error: string | null;
}
