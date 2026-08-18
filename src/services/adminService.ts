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
  getProducts: async (page = 1, limit = 10, merchantId = '', categoryId = '') => {
    let url = `${API_URL}/admin/product?page=${page}&limit=${limit}`;
    if (merchantId) {
      url += `&merchantId=${encodeURIComponent(merchantId)}`;
    }
    if (categoryId) {
      url += `&categoryId=${encodeURIComponent(categoryId)}`;
    }
    const res = await fetch(url, {
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

  // Admin Categories
  getAdminCategories: async (page = 1, limit = 10, merchantId = '') => {
    let url = `${API_URL}/admin/category?page=${page}&limit=${limit}`;
    if (merchantId) {
      url += `&merchantId=${encodeURIComponent(merchantId)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAdminCategoryById: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/category/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCategory: async (data: any) => {
    const res = await fetch(`${API_URL}/admin/category`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCategory: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/category/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteCategory: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/category/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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

  // Merchant Management
  getAdminMerchants: async (page = 1, limit = 10, search = '', status = '') => {
    let url = `${API_URL}/admin/merchant?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAdminMerchantById: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/merchant/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createMerchant: async (data: any) => {
    const res = await fetch(`${API_URL}/admin/merchant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateMerchant: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/merchant/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteMerchant: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/merchant/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  verifyMerchant: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/merchant/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Customer / User Management
  getAdminUsers: async (page = 1, limit = 10, search = '', status = '') => {
    let url = `${API_URL}/admin/user?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAdminUserById: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/user/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createUser: async (data: any) => {
    const res = await fetch(`${API_URL}/admin/user`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateUser: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/user/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/user/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateUserStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/user/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  getUserOrders: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/user/${id}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getMerchants: async () => {
    try {
      const res = await fetch(`${API_URL}/admin/merchant?limit=100`, { 
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return res.json();
    } catch {
      return { status: false, data: [] };
    }
  }
};
