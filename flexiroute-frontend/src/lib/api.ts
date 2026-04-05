const BASE_URL = '/api/proxy';

export interface Warehouse {
  id: number;
  name: string;
  x_coord: number;
  y_coord: number;
  delivery_radius: number;
}

export interface Product {
  id: number;
  warehouse: number;
  name: string;
  count: number;
  mass: number;
}

export interface Truck {
  id: number;
  warehouse: number;
  status: number;
  status_display: string;
  capacity: number;
  current_load: number;
  current_x: number;
  current_y: number;
  is_full: boolean;
}

export interface DeliveryPoint {
  id: number;
  name: string;
  x_coord: number;
  y_coord: number;
  priority_level: number;
  priority_display: string;
  need_name: string;
  need_capacity: number;
  current_stock_percent: number;
  next_delivery: string | null;
}

export interface Order {
  id: number;
  delivery_point: number;
  priority: number;
  priority_display: string;
  urgency_level: number;
  urgency_display: string;
  quantity: number;
  status: 'PENDING' | 'REJECTED' | 'REDIRECTED' | 'LOADING' | 'FULFILLED';
  status_display: string;
  approval_mode: 'NONE' | 'AUTO' | 'MANUAL';
  approval_mode_display: string;
  decision_reason: string;
  decided_by: number | null;
  decided_by_username?: string;
  decided_at: string | null;
  time: string;
  content: string;
  priority_score?: number;
  demand_ratio?: number;
  priority_multiplier?: number;
  time_since_last_delivery?: number;
}

export interface SurplusPoint {
  id: number;
  name: string;
  current_stock_percent: number;
  need_capacity: number;
  distance: number | null;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const authHeaders: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      authHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Stale/invalid JWT is common after reseeding demo data.
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('workplaceId');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    throw new Error(`API error (${response.status}): ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getWarehouses: () => apiFetch<Warehouse[]>('/warehouses/'),
  getProducts: () => apiFetch<Product[]>('/products/'),
  getTrucks: () => apiFetch<Truck[]>('/trucks/'),
  getDeliveryPoints: () => apiFetch<DeliveryPoint[]>('/delivery/points/'),
  getOrders: (statuses?: Array<Order['status']>) => {
    const suffix = statuses && statuses.length > 0 ? `?status=${statuses.join(',')}` : '';
    return apiFetch<Order[]>(`/delivery/orders/${suffix}`);
  },
  getRecommendations: () => apiFetch<Order[]>('/delivery/orders/recommendations/'),
  getPointRequests: (pointId: number, limit = 20) => apiFetch<Order[]>(`/delivery/points/${pointId}/requests/?limit=${limit}`),
  getSurplusPoints: (targetId?: number) => {
    const suffix = typeof targetId === 'number' ? `?target_id=${targetId}` : '';
    return apiFetch<SurplusPoint[]>(`/delivery/points/surplus/${suffix}`);
  },
  createOrder: (order: Partial<Order>) => apiFetch<Order>('/delivery/orders/', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  createUrgentRequest: (payload: { delivery_point_id: number; quantity: number; content?: string }) =>
    apiFetch<{ status: string; message: string; data: Order }>('/delivery/orders/urgent/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  suggestRedirect: (orderId: number) => apiFetch<{
    status: string;
    suggestion: string;
    donor_id: number;
    target_id: number;
    distance: number;
  }>(`/delivery/orders/${orderId}/suggest_redirect/`),
  approveRedirect: (orderId: number) => apiFetch<Order>(`/delivery/orders/${orderId}/approve_redirect/`, {
    method: 'POST',
  }),
  rejectRequest: (orderId: number, reason?: string) => apiFetch<Order>(`/delivery/orders/${orderId}/reject_request/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  markLoading: (orderId: number) => apiFetch<Order>(`/delivery/orders/${orderId}/mark_loading/`, {
    method: 'POST',
  }),
  fulfillOrder: (orderId: number, delivered_quantity?: number) =>
    apiFetch<{ order: Order; delivery_point: DeliveryPoint }>(`/delivery/orders/${orderId}/fulfill/`, {
      method: 'POST',
      body: JSON.stringify({ delivered_quantity }),
    }),
  updateTruck: (id: number, data: Partial<Truck>) => apiFetch<Truck>(`/trucks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
