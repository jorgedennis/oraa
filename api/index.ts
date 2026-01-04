const API_URL = 'https://n8n.srv1244885.hstgr.cloud/webhook';

// Types
export interface AuthResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  jwt?: string;
  refresh_token?: string;
  session_id?: string;
  usage_status?: UsageStatus;
  message?: string;
  error?: string;
}

export interface UsageStatus {
  type: 'anonymous' | 'registered';
  messages_used: number;
  messages_limit: number;
  messages_remaining: number;
  is_lifetime_limit?: boolean;
  resets_at?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversation_id: string;
  rate_limit: {
    allowed: boolean;
    reason?: string;
    messages_used?: number;
    messages_remaining?: number;
    message?: string;
  };
}

// Auth API
export const authAPI = {
  /**
   * Get or create an anonymous session
   */
  async getSession(deviceId: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_session',
          device_id: deviceId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Log in existing user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email,
          password
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};

// Chat API
export const chatAPI = {
  /**
   * Send a chat message
   */
  async sendMessage(params: {
    session_id?: string;
    user_id?: string;
    conversation_id?: string;
    message: string;
  }): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle rate limit exceeded
      if (data.rate_limit && !data.rate_limit.allowed) {
        return {
          success: false,
          message: data.rate_limit.message || 'Rate limit exceeded',
          conversation_id: params.conversation_id || '',
          rate_limit: data.rate_limit
        };
      }
      
      return data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
};
