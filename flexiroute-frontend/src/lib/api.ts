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
  status: 'PENDING' | 'REDIRECTED' | 'FULFILLED';
  status_display: string;
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
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getWarehouses: () => apiFetch<Warehouse[]>('/warehouses/'),
  getProducts: () => apiFetch<Product[]>('/products/'),
  getTrucks: () => apiFetch<Truck[]>('/trucks/'),
  getDeliveryPoints: () => apiFetch<DeliveryPoint[]>('/delivery/points/'),
  getOrders: () => apiFetch<Order[]>('/delivery/orders/'),
  getRecommendations: () => apiFetch<Order[]>('/delivery/orders/recommendations/'),
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
