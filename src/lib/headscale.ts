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

  async moveNode(nodeId: string, newUser: string) {
    return this.request(`/node/${nodeId}/user`, {
      method: 'POST',
      body: JSON.stringify({ user: newUser }),
    });
  }

  async setNodeTags(nodeId: string, tags: string[]) {
    return this.request(`/node/${nodeId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  }

  // Routes Management
  async listRoutes() {
    return this.request('/routes');
  }

  async enableRoute(routeId: string) {
    return this.request(`/routes/${routeId}/enable`, {
      method: 'POST',
    });
  }

  async disableRoute(routeId: string) {
    return this.request(`/routes/${routeId}/disable`, {
      method: 'POST',
    });
  }

  async deleteRoute(routeId: string) {
    return this.request(`/routes/${routeId}`, {
      method: 'DELETE',
    });
  }

  // Pre-auth Keys - FIXED VERSION
  async createPreAuthKey(user: string, reusable: boolean = false, ephemeral: boolean = false, expiration?: string, aclTags: string[] = []) {
    const body: any = {
      user: user,
      reusable: reusable,
      ephemeral: ephemeral,
    };
    
    if (expiration) {
      body.expiration = new Date(expiration).toISOString();
    }
    
    if (aclTags.length > 0) {
      body.aclTags = aclTags;
    }

    console.log('Creating pre-auth key with body:', body);

    return this.request('/preauthkey', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async listPreAuthKeys(user?: string) {
    const endpoint = user ? `/preauthkey?user=${encodeURIComponent(user)}` : '/preauthkey';
    return this.request(endpoint);
  }

  async expirePreAuthKey(user: string, key: string) {
    return this.request(`/preauthkey/expire`, {
      method: 'POST',
      body: JSON.stringify({ user: user, key: key }),
    });
  }

  // API Keys
  async createApiKey(expiration: string) {
    return this.request('/apikey', {
      method: 'POST',
      body: JSON.stringify({ expiration }),
    });
  }

  async listApiKeys() {
    return this.request('/apikey');
  }

  async deleteApiKey(prefix: string) {
    return this.request(`/apikey/${prefix}`, {
      method: 'DELETE',
    });
  }

  // DNS Management
  async getDNSConfig() {
    return this.request('/dns');
  }

  async setDNSConfig(config: any) {
    return this.request('/dns', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  // ACL Management
  async getACL() {
    return this.request('/acl');
  }

  async setACL(acl: any) {
    return this.request('/acl', {
      method: 'POST',
      body: JSON.stringify(acl),
    });
  }
}

export const headscale = new HeadscaleAPI();