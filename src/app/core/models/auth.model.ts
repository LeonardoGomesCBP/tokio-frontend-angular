export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  name: string;
  roles: string[];
}

export interface ApiResponse<T> {
  result: 'SUCCESS' | 'ERROR';
  message: string;
  data: T;
} 