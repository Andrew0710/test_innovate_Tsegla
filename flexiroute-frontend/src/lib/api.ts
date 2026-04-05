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
  getWarehouses: () => process.env.NODE_ENV === 'development' ? Promise.resolve(mockWarehouses) : apiFetch<Warehouse[]>('/warehouses/'),
  getProducts: () => process.env.NODE_ENV === 'development' ? Promise.resolve(mockProducts) : apiFetch<Product[]>('/products/'),
  getTrucks: () => process.env.NODE_ENV === 'development' ? Promise.resolve(mockTrucks) : apiFetch<Truck[]>('/trucks/'),
  getDeliveryPoints: () => process.env.NODE_ENV === 'development' ? Promise.resolve(mockDeliveryPoints) : apiFetch<DeliveryPoint[]>('/delivery/points/'),
  getOrders: (statuses?: Array<Order['status']>) => {
    if (process.env.NODE_ENV === 'development') {
      const filtered = statuses && statuses.length > 0 ? mockOrders.filter(o => statuses.includes(o.status)) : mockOrders;
      return Promise.resolve(filtered);
    }
    const suffix = statuses && statuses.length > 0 ? `?status=${statuses.join(',')}` : '';
    return apiFetch<Order[]>(`/delivery/orders/${suffix}`);
  },
  getRecommendations: () => process.env.NODE_ENV === 'development' ? Promise.resolve(mockRecommendations) : apiFetch<Order[]>('/delivery/orders/recommendations/'),
  getPointRequests: (pointId: number, limit = 20) => process.env.NODE_ENV === 'development' ? Promise.resolve(mockOrders.filter(o => o.delivery_point === pointId).slice(0, limit)) : apiFetch<Order[]>(`/delivery/points/${pointId}/requests/?limit=${limit}`),
  getSurplusPoints: (targetId?: number) => process.env.NODE_ENV === 'development' ? Promise.resolve(mockSurplusPoints) : (() => {
    const suffix = typeof targetId === 'number' ? `?target_id=${targetId}` : '';
    return apiFetch<SurplusPoint[]>(`/delivery/points/surplus/${suffix}`);
  })(),
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

// Mock data for development
const mockWarehouses: Warehouse[] = [
  { id: 1, name: 'Central Warehouse', x_coord: 50.45, y_coord: 30.52, delivery_radius: 100 },
];

const mockProducts: Product[] = [
  { id: 1, warehouse: 1, name: 'Product A', count: 1000, mass: 10 },
];

const mockTrucks: Truck[] = [
  { id: 1, warehouse: 1, status: 1, status_display: 'Available', capacity: 5000, current_load: 2000, current_x: 50.45, current_y: 30.52, is_full: false },
  { id: 2, warehouse: 1, status: 2, status_display: 'In Transit', capacity: 5000, current_load: 4000, current_x: 50.5, current_y: 30.6, is_full: false },
];

const mockDeliveryPoints: DeliveryPoint[] = [
  { id: 1, name: 'Point A', x_coord: 50.4, y_coord: 30.5, priority_level: 3, priority_display: 'Critical', need_name: 'Fuel', need_capacity: 500, current_stock_percent: 20, next_delivery: null },
  { id: 2, name: 'Point B', x_coord: 50.5, y_coord: 30.6, priority_level: 2, priority_display: 'Normal', need_name: 'Fuel', need_capacity: 300, current_stock_percent: 60, next_delivery: '2024-01-15' },
  { id: 3, name: 'Point C', x_coord: 50.6, y_coord: 30.7, priority_level: 1, priority_display: 'Low', need_name: 'Fuel', need_capacity: 200, current_stock_percent: 80, next_delivery: null },
];

const mockOrders: Order[] = [
  { id: 1, delivery_point: 1, priority: 3, priority_display: 'High', urgency_level: 3, urgency_display: 'Critical', status: 'PENDING', status_display: 'Pending', quantity: 200, time: '2024-01-10T10:00:00Z', approval_mode: 'NONE', approval_mode_display: 'None', content: 'Urgent fuel delivery' },
  { id: 2, delivery_point: 2, priority: 2, priority_display: 'Medium', urgency_level: 2, urgency_display: 'Normal', status: 'LOADING', status_display: 'Loading', quantity: 150, time: '2024-01-09T14:00:00Z', approval_mode: 'AUTO', approval_mode_display: 'Auto', content: 'Regular supply' },
];

const mockRecommendations: Order[] = [
  { id: 3, delivery_point: 1, priority: 3, priority_display: 'High', urgency_level: 3, urgency_display: 'Critical', status: 'PENDING', status_display: 'Pending', quantity: 100, time: '2024-01-11T08:00:00Z', approval_mode: 'NONE', approval_mode_display: 'None', content: 'AI recommended redirect' },
];

const mockSurplusPoints: SurplusPoint[] = [
  { id: 2, name: 'Point B', available_quantity: 100, distance: 5.2 },
];
