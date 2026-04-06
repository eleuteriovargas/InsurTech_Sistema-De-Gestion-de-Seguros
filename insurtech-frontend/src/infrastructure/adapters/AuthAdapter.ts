import httpClient from '../api/httpClient';
import type { IAuthRepository, LoginCredentials, AuthResponse, ApiResponse } from '../../domain/interfaces';

export class AuthAdapter implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  }

  async register(data: any): Promise<string> {
    const response = await httpClient.post<ApiResponse<string>>('/auth/register', data);
    return response.data.data;
  }
}

export const authAdapter = new AuthAdapter();
