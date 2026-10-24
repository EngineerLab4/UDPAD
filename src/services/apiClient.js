const API_BASE = '/api';

class ApiClient {
  getToken() {
    try {
      const session = localStorage.getItem('udpad_v2_auth_session');
      if (session) {
        const user = JSON.parse(session);
        return user.token || '';
      }
    } catch (e) {
      console.error('Error reading auth token', e);
    }
    return '';
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const isGatewayError = [502, 503, 504].includes(response.status);
        return {
          ok: false,
          status: response.status,
          error: isGatewayError
            ? 'Backend service is unreachable (502 Bad Gateway). Check that the UDPAD server is running on port 5001.'
            : (data?.error || `Request failed with status ${response.status}`),
          data,
          isGatewayError
        };
      }

      return {
        ok: true,
        status: response.status,
        data
      };
    } catch (err) {
      // Network or offline error
      return {
        ok: false,
        status: 0,
        error: err.message || 'Network connection error',
        networkError: true
      };
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }
}

export const api = new ApiClient();
export { censusService } from './censusService.js';
