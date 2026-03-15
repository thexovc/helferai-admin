export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
