export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}
