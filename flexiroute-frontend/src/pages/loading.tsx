import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import { api, DeliveryPoint, Order } from '../lib/api';

export default function LoadingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pointsById, setPointsById] = useState<Record<number, DeliveryPoint>>({});
  const [approvedQueue, setApprovedQueue] = useState<Order[]>([]);
  const [loadingQueue, setLoadingQueue] = useState<Order[]>([]);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  // --- ЗАХИСТ МАРШРУТУ ---
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    if (!isAuthenticated || userRole !== 'dispatcher') {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchQueues = async () => {
    const [points, orders] = await Promise.all([
      api.getDeliveryPoints(),
      api.getOrders(['REDIRECTED', 'LOADING']),
    ]);
    const mappedPoints = points.reduce<Record<number, DeliveryPoint>>((acc, point) => {
      acc[point.id] = point;
      return acc;
    }, {});

    setPointsById(mappedPoints);
    setApprovedQueue(orders.filter((order) => order.status === 'REDIRECTED'));
    setLoadingQueue(orders.filter((order) => order.status === 'LOADING'));
  };

  useEffect(() => {
    if (isLoading) return;

    async function loadData() {
      try {
        await fetchQueues();
      } catch (error) {
        console.error('Failed to fetch loading queues:', error);
      }
    }

    loadData();
  }, [isLoading]);

  const handleStartLoading = async (orderId: number) => {
    setSubmittingId(orderId);
    try {
      await api.markLoading(orderId);
      await fetchQueues();
    } catch (error) {
      console.error('Failed to move order to loading:', error);
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) return null;

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans animate-[fadeIn_0.3s_ease-in-out]">
      <Head><title>Loading Queue | FlexiRoute</title></Head>

      {/* --- SIDEBAR --- */}
      <Sidebar activePage="loading" />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
        <div className="max-w-4xl flex flex-col gap-8">
          
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Dispatcher Workflow
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Loading Queue</h1>
            <p className="text-gray-500 font-medium mt-3">Prepare approved requests for driver execution.</p>
          </div>

          <section className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Awaiting Loading</h2>
            <div className="flex flex-col gap-4">
              {approvedQueue.length === 0 && (
                <p className="text-sm text-gray-500 font-medium">No approved requests waiting for loading.</p>
              )}
              {approvedQueue.map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">#{order.id} • {pointsById[order.delivery_point]?.name || `Point #${order.delivery_point}`}</p>
                    <p className="text-sm text-gray-500 font-medium">{order.quantity} units • {order.urgency_display} • {order.approval_mode_display}</p>
                  </div>
                  <button
                    onClick={() => handleStartLoading(order.id)}
                    disabled={submittingId === order.id}
                    className="bg-[#DA291C] hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl transition-colors disabled:opacity-60"
                  >
                    {submittingId === order.id ? 'Moving...' : 'Start Loading'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-[32px] border border-gray-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Now Loading</h2>
            <div className="flex flex-col gap-4">
              {loadingQueue.length === 0 && (
                <p className="text-sm text-gray-500 font-medium">No orders currently in loading stage.</p>
              )}
              {loadingQueue.map((order) => (
                <div key={order.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-bold text-gray-900">#{order.id} • {pointsById[order.delivery_point]?.name || `Point #${order.delivery_point}`}</p>
                  <p className="text-sm text-gray-500 font-medium">{order.quantity} units • Ready for truck execution</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}