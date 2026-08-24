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
  getAdminMerchants: async (page = 1, limit = 10, search = '', status = '', is_verified = '') => {
    let url = `${API_URL}/admin/merchant?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    if (is_verified !== '') {
      url += `&is_verified=${encodeURIComponent(is_verified)}`;
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

  verifyMerchant: async (id: string, is_verified?: boolean) => {
    const res = await fetch(`${API_URL}/admin/merchant/${id}/verify`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: typeof is_verified !== 'undefined' ? JSON.stringify({ is_verified }) : undefined,
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
  },

  // Carousel / Banner Management
  getAdminCarousels: async (page = 1, limit = 10, merchantId = '', isActive?: boolean, search = '') => {
    let url = `${API_URL}/admin/carousel?page=${page}&limit=${limit}`;
    if (merchantId) {
      url += `&merchantId=${encodeURIComponent(merchantId)}`;
    }
    if (typeof isActive === 'boolean') {
      url += `&isActive=${isActive}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch carousels' };
    }
  },

  getAdminCarouselById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/carousel/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch carousel' };
    }
  },

  createCarousel: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/carousel`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to create carousel' };
    }
  },

  updateCarousel: async (id: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/carousel/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update carousel' };
    }
  },

  deleteCarousel: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/carousel/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to delete carousel' };
    }
  },

  toggleCarouselStatus: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/carousel/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update status' };
    }
  },

  // News / Articles Management
  getNews: async (page = 1, limit = 10, merchantId = '', search = '', is_active = '') => {
    try {
      let url = `${API_URL}/admin/news?page=${page}&limit=${limit}`;
      if (merchantId) {
        url += `&merchantId=${encodeURIComponent(merchantId)}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (is_active !== '') {
        url += `&is_active=${encodeURIComponent(is_active)}`;
      }
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch news' };
    }
  },

  getNewsById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch news article' };
    }
  },

  createNews: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/news`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to create news article' };
    }
  },

  updateNews: async (id: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update news article' };
    }
  },

  deleteNews: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to delete news article' };
    }
  },

  toggleNewsStatus: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/news/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update news status' };
    }
  },

  // Brand Management
  getAdminBrands: async (page = 1, limit = 10, merchantId = '', search = '') => {
    let url = `${API_URL}/admin/brand?page=${page}&limit=${limit}`;
    if (merchantId) {
      url += `&merchantId=${encodeURIComponent(merchantId)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch brands' };
    }
  },

  getAdminBrandById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/brand/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch brand' };
    }
  },

  createBrand: async (data: FormData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch(`${API_URL}/admin/brand`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: data,
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to create brand' };
    }
  },

  updateBrand: async (id: string, data: FormData) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch(`${API_URL}/admin/brand/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: data,
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update brand' };
    }
  },

  deleteBrand: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/brand/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to delete brand' };
    }
  },

  // Wallet / Recharge Requests Management
  getRechargeRequests: async (page = 1, limit = 10, status = '') => {
    let url = `${API_URL}/admin/wallet/recharge-requests?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch recharge requests' };
    }
  },

  updateRechargeStatus: async (requestId: string, status: string, adminRemarks: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/wallet/recharge-requests/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminRemarks }),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update recharge request status' };
    }
  },

  // Coin Management
  addCoinToUser: async (userId: string, amount: number, description: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/coin/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, amount, description }),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to add coins to user' };
    }
  },

  // Wallet Details Management
  getUserWallet: async (userId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/wallet/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch user wallet' };
    }
  },

  getWalletTransactions: async (userId: string, walletType = 'balance', page = 1, limit = 10) => {
    try {
      const res = await fetch(`${API_URL}/admin/wallet/${userId}/transactions?walletType=${walletType}&page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch wallet transactions' };
    }
  }
};

