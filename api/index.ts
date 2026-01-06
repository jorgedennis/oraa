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
  // Thread context inference
  inferred_threads?: { id: string; title: string }[];
  // Soft reminder (if an existing insight was re-detected)
  reminder?: {
    insight_id: string;
    observation: string;
    domain?: string;
  };
}

// Thread types
export interface Thread {
  id: string;
  title: string;
  type: 'people' | 'self' | 'situation';
  status: 'active' | 'resolved' | 'paused' | 'archived';
  current_understanding?: string;
  mention_count: number;
  last_mentioned_at?: string;
  created_at: string;
  timeline?: Array<{ id: string; date: string; summary: string }>;
  your_patterns_here?: Array<{ id: string; observation: string; domain: string; detected_at: string }>;
  working_understanding?: Array<{ id: string; observation: string; user_response?: string }>;
  still_curious_about?: Array<{ id: string; question: string; is_answered: boolean }>;
}

export interface ThreadSuggestion {
  id: string;
  topic: string;
  description: string;
  mention_count: number;
}

export interface ThreadsResponse {
  success: boolean;
  threads?: Thread[];
  thread?: Thread;
  error?: string;
}

export interface ThreadSuggestionsResponse {
  success: boolean;
  suggestions?: ThreadSuggestion[];
  error?: string;
}

// Insight types
export interface StagedItem {
  queue_id: string;
  item_type: 'self_insight' | 'thread_insight' | 'thread_suggestion';
  item_id: string;
  thread_id?: string;
  thread_title?: string;
  created_at: string;
  observation?: string;
  domain_id?: string;
  topic?: string;
  description?: string;
  mention_count?: number;
}

export interface DomainWithInsights {
  domain_id: string;
  domain_name: string;
  domain_icon: string;
  insights: Array<{
    id: string;
    observation: string;
    domain_id: string;
    user_response?: string;
    user_note?: string;
    first_detected_at: string;
    detection_count: number;
    acknowledged_at?: string;
    thread_associations: Array<{ thread_id: string; thread_title: string; detected_at: string }>;
  }>;
}

export interface StagingQueueResponse {
  success: boolean;
  items?: StagedItem[];
  error?: string;
}

export interface MapInsightsResponse {
  success: boolean;
  domains?: DomainWithInsights[];
  error?: string;
}

export interface GenericResponse {
  success: boolean;
  error?: string;
  message?: string;
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
    thread_ids?: string[];
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

// Threads API
export const threadsAPI = {
  /**
   * Fetch all threads for the user
   */
  async fetchThreads(): Promise<ThreadsResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch threads error:', error);
      throw error;
    }
  },

  /**
   * Fetch a single thread with full context
   */
  async fetchThread(threadId: string): Promise<ThreadsResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get', thread_id: threadId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch thread error:', error);
      throw error;
    }
  },

  /**
   * Create a new thread
   */
  async createThread(params: {
    title: string;
    type: 'people' | 'self' | 'situation';
    initialUnderstanding?: string;
  }): Promise<ThreadsResponse & { thread?: Thread }> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title: params.title,
          type: params.type,
          initial_understanding: params.initialUnderstanding
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create thread error:', error);
      throw error;
    }
  },

  /**
   * Create thread from suggestion
   */
  async createThreadFromSuggestion(suggestionId: string, type?: 'people' | 'self' | 'situation'): Promise<ThreadsResponse & { thread?: Thread }> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_from_suggestion',
          suggestion_id: suggestionId,
          type
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create thread from suggestion error:', error);
      throw error;
    }
  },

  /**
   * Update a thread
   */
  async updateThread(threadId: string, updates: Partial<Thread>): Promise<GenericResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          thread_id: threadId,
          ...updates
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update thread error:', error);
      throw error;
    }
  },

  /**
   * Delete a thread
   */
  async deleteThread(threadId: string): Promise<GenericResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          thread_id: threadId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete thread error:', error);
      throw error;
    }
  },

  /**
   * Fetch thread suggestions
   */
  async fetchSuggestions(): Promise<ThreadSuggestionsResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggestions' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch suggestions error:', error);
      throw error;
    }
  },

  /**
   * Dismiss a thread suggestion
   */
  async dismissSuggestion(suggestionId: string): Promise<GenericResponse> {
    try {
      const response = await fetch(`${API_URL}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss_suggestion',
          suggestion_id: suggestionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Dismiss suggestion error:', error);
      throw error;
    }
  }
};

// Insights API
export const insightsAPI = {
  /**
   * Fetch the staging queue
   */
  async fetchStagingQueue(): Promise<StagingQueueResponse> {
    try {
      const response = await fetch(`${API_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'staging_queue' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch staging queue error:', error);
      throw error;
    }
  },

  /**
   * Respond to a staged insight
   */
  async respondToInsight(queueId: string, response: 'yes' | 'maybe' | 'no' | 'partially', note?: string): Promise<GenericResponse> {
    try {
      const apiResponse = await fetch(`${API_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond',
          queue_id: queueId,
          response,
          note
        })
      });
      
      if (!apiResponse.ok) {
        throw new Error(`HTTP ${apiResponse.status}`);
      }
      
      return await apiResponse.json();
    } catch (error) {
      console.error('Respond to insight error:', error);
      throw error;
    }
  },

  /**
   * Fetch Map insights (organized by domain)
   */
  async fetchMapInsights(): Promise<MapInsightsResponse> {
    try {
      const response = await fetch(`${API_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'map' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fetch map insights error:', error);
      throw error;
    }
  },

  /**
   * Delete an insight
   */
  async deleteInsight(insightId: string): Promise<GenericResponse> {
    try {
      const response = await fetch(`${API_URL}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          insight_id: insightId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete insight error:', error);
      throw error;
    }
  }
};
