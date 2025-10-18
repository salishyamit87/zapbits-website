const HEADSCALE_SERVER_URL = process.env.HEADSCALE_SERVER_URL;
const HEADSCALE_API_KEY = process.env.HEADSCALE_API_KEY;

class HeadscaleAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    if (!HEADSCALE_SERVER_URL || !HEADSCALE_API_KEY) {
      throw new Error('Headscale environment variables are not set');
    }
    this.baseUrl = HEADSCALE_SERVER_URL;
    this.apiKey = HEADSCALE_API_KEY;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Headscale API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  // User Management
  async createUser(name: string) {
    return this.request('/user', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async listUsers() {
    return this.request('/user');
  }

  async getUser(name: string) {
    return this.request(`/user/${name}`);
  }

  async deleteUser(name: string) {
    return this.request(`/user/${name}`, {
      method: 'DELETE',
    });
  }

  // Node Management - Filter by user
  async listUserNodes(userName: string) {
    const allNodes = await this.request('/node');
    if (allNodes.nodes) {
      return {
        nodes: allNodes.nodes.filter((node: any) => node.user.name === userName)
      };
    }
    return { nodes: [] };
  }

  async getNode(nodeId: string) {
    return this.request(`/node/${nodeId}`);
  }

  async deleteNode(nodeId: string) {
    return this.request(`/node/${nodeId}`, {
      method: 'DELETE',
    });
  }

  async expireNode(nodeId: string) {
    return this.request(`/node/${nodeId}/expire`, {
      method: 'POST',
    });
  }

  async renameNode(nodeId: string, newName: string) {
    return this.request(`/node/${nodeId}/rename`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
    });
  }

  // Pre-auth Keys
  async createPreAuthKey(user: string, reusable: boolean = false, ephemeral: boolean = false) {
    return this.request('/preauthkey', {
      method: 'POST',
      body: JSON.stringify({
        user,
        reusable,
        ephemeral,
      }),
    });
  }

  async listPreAuthKeys(user: string) {
    return this.request(`/preauthkey?user=${user}`);
  }

  async expirePreAuthKey(user: string, key: string) {
    return this.request(`/preauthkey/expire`, {
      method: 'POST',
      body: JSON.stringify({ user, key }),
    });
  }
}

export const headscale = new HeadscaleAPI();