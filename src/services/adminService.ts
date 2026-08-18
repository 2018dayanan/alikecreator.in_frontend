const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const adminService = {
  // Authentication
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  // Products
  getProducts: async (page = 1, limit = 10) => {
    const res = await fetch(`${API_URL}/admin/product?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/product/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/product/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createProduct: async (data: any) => {
    const res = await fetch(`${API_URL}/admin/product`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateProduct: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/product/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getCategories: async () => {
    try {
      const res = await fetch(`${API_URL}/public/categories`, {
        method: 'GET',
      });
      return res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  getMerchants: async () => {
    // There might not be a direct route to get all merchants, fallback to empty array if it fails
    try {
      const res = await fetch(`${API_URL}/admin/merchant`, { 
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return res.json();
    } catch {
      return { status: false, data: [] };
    }
  }
};
