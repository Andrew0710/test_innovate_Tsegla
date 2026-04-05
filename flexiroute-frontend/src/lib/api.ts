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
  next_delivery: string | null;
}

export interface Order {
  id: number;
  delivery_point: number;
  priority: number;
  priority_display: string;
  time: string;
  content: string;
}

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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
  createOrder: (order: Partial<Order>) => apiFetch<Order>('/delivery/orders/', {
    method: 'POST',
    body: JSON.stringify(order),
  }),
  updateTruck: (id: number, data: Partial<Truck>) => apiFetch<Truck>(`/trucks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
