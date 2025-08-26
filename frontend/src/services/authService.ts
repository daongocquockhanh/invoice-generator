import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const loginData: LoginRequest = { email, password };
    
    return this.makeRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await this.makeRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    return response.data.tokens;
  }

  async getCurrentUser(accessToken: string): Promise<User> {
    return this.makeRequest<User>('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async updateProfile(accessToken: string, userData: Partial<User>): Promise<User> {
    return this.makeRequest<User>('/api/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });
  }

  async changePassword(
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/api/users/password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  }
}

export const authService = new AuthService();
