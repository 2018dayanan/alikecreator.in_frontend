const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3087/api/v1';

// Helper to get auth headers for merchant
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('merchantToken') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const merchantService = {
  // Authentication & Profile
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/merchant/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (data: any) => {
    const res = await fetch(`${API_URL}/merchant/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_URL}/merchant/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_URL}/merchant/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/merchant/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return res.json();
  },

  // Dashboard Overview
  getDashboardStats: async () => {
    const res = await fetch(`${API_URL}/merchant/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Product Management
  getProducts: async (page = 1, limit = 10, categoryId = '', search = '') => {
    let url = `${API_URL}/merchant/product?page=${page}&limit=${limit}`;
    if (categoryId) {
      url += `&categoryId=${encodeURIComponent(categoryId)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_URL}/merchant/product/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createProduct: async (data: any) => {
    const res = await fetch(`${API_URL}/merchant/product`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateProduct: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/merchant/product/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/merchant/product/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Category Management
  getCategories: async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/merchant/category?page=${page}&limit=${limit}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getAvailableCategories: async () => {
    const res = await fetch(`${API_URL}/merchant/category/available`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getCategoryById: async (id: string) => {
    const res = await fetch(`${API_URL}/merchant/category/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  createCategory: async (data: any) => {
    const res = await fetch(`${API_URL}/merchant/category`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateCategory: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/merchant/category/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteCategory: async (id: string) => {
    const res = await fetch(`${API_URL}/merchant/category/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Order Management
  getOrders: async (page = 1, limit = 10, status = '') => {
    let url = `${API_URL}/merchant/order?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  getOrderById: async (id: string) => {
    const res = await fetch(`${API_URL}/merchant/order/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  updateOrderStatus: async (id: string, orderStatus: string, trackingNumber?: string) => {
    const res = await fetch(`${API_URL}/merchant/order/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderStatus, trackingNumber }),
    });
    return res.json();
  },

  // Carousel / Banner Management
  getCarousels: async (page = 1, limit = 10, isActive?: boolean, search = '') => {
    let url = `${API_URL}/merchant/carousel?page=${page}&limit=${limit}`;
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

  getCarouselById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/merchant/carousel/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/carousel`, {
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
      const res = await fetch(`${API_URL}/merchant/carousel/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/carousel/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/carousel/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update status' };
    }
  },

  // Discover / Latest Collection Management
  getDiscoverItems: async (page = 1, limit = 50, isActive?: boolean) => {
    let url = `${API_URL}/merchant/discover?page=${page}&limit=${limit}`;
    if (typeof isActive === 'boolean') {
      url += `&isActive=${isActive}`;
    }
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch discover items' };
    }
  },

  getDiscoverById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to fetch discover item' };
    }
  },

  addDiscoverItem: async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to add product to discover' };
    }
  },

  syncDiscoverProducts: async (productIds: string[]) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productIds }),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to sync discover collection' };
    }
  },

  updateDiscoverItem: async (id: string, data: any) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update discover item' };
    }
  },

  deleteDiscoverItem: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to delete discover item' };
    }
  },

  toggleDiscoverStatus: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/merchant/discover/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update status' };
    }
  },

  // Merchant News / Articles Management
  getMyNews: async (page = 1, limit = 10, search = '', is_active = '') => {
    try {
      let url = `${API_URL}/merchant/news?page=${page}&limit=${limit}`;
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
      return { status: false, message: err.message || 'Failed to fetch news articles' };
    }
  },

  getNewsById: async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/merchant/news/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/news`, {
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
      const res = await fetch(`${API_URL}/merchant/news/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/news/${id}`, {
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
      const res = await fetch(`${API_URL}/merchant/news/${id}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return await res.json();
    } catch (err: any) {
      return { status: false, message: err.message || 'Failed to update news status' };
    }
  }
};

