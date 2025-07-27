import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { Clock, Truck, History } from 'lucide-react';

const UserProfile: React.FC = () => {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getMyOrders();
        setOrders(res);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message || 'Failed to load orders');
        } else {
          setError('Failed to load orders');
        }
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    setCancelling(true);
    try {
      await apiService.cancelOrder(orderId);
      setOrders(orders => orders.map((o: Record<string, unknown>) => o._id === orderId ? { ...o, status: 'cancelled', cancelledAt: new Date().toISOString() } : o));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || 'Failed to cancel order');
      } else {
        setError('Failed to cancel order');
      }
    }
    setCancelling(false);
    setCancelOrderId(null);
  };

  // Divide orders into pending, active, and order history
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => order.status === 'active' || order.status === 'confirmed');
  const orderHistory = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

  // Tab state
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('active');

  // Tab config
  const TABS = [
    { id: 'pending', icon: <Clock className="w-6 h-6 sm:hidden" aria-label="Pending Orders" />, text: <span className="hidden sm:inline">Pending Orders</span> },
    { id: 'active', icon: <Truck className="w-6 h-6 sm:hidden" aria-label="Active Orders" />, text: <span className="hidden sm:inline">Active Orders</span> },
    { id: 'history', icon: <History className="w-6 h-6 sm:hidden" aria-label="Order History" />, text: <span className="hidden sm:inline">Order History</span> },
  ];

  // Get orders for current tab
  let displayedOrders: any[] = [];
  if (activeTab === 'pending') displayedOrders = pendingOrders;
  else if (activeTab === 'active') displayedOrders = activeOrders;
  else if (activeTab === 'history') displayedOrders = orderHistory;

  // Tab empty text
  const emptyText =
    activeTab === 'pending' ? 'No pending orders.' :
    activeTab === 'active' ? 'No active orders.' :
    'No order history.';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 pt-32">
      <h1 className="text-3xl font-bold mb-8 text-center">All Orders</h1>
      {/* Horizontal Tabs */}
      <div className="flex flex-row justify-center items-center gap-6 sm:gap-8 mb-8 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`mx-auto flex-shrink-0 w-auto h-auto py-3 text-base sm:text-lg font-semibold focus:outline-none transition-colors border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-600 hover:text-emerald-600'} rounded-t-xl sm:rounded-t-2xl flex items-center justify-center`}
          >
            {tab.icon}{tab.text}
          </button>
        ))}
      </div>
      {/* Orders List for Selected Tab */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
        {loading ? (
          <div className="text-gray-500">Loading orders...</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-gray-500 font-extrabold text-2xl">{emptyText}</div>
        ) : (
          <div className="space-y-8">
            {displayedOrders.map((order: Record<string, unknown>) => (
              <div key={order._id} className="border-b border-gray-100 pb-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-xl text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                  {activeTab === 'pending' && <span className="px-4 py-2 rounded-full text-base font-semibold bg-yellow-100 text-yellow-700">Pending</span>}
                  {activeTab === 'active' && <span className="px-4 py-2 rounded-full text-base font-semibold bg-green-100 text-green-700">Active</span>}
                  {activeTab === 'history' && (
                    <span className={`px-4 py-2 rounded-full text-base font-semibold ${order.status === 'cancelled' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-700'}`}>{order.status === 'cancelled' ? 'Cancelled' : 'Delivered'}</span>
                  )}
                </div>
                <div className="text-base text-gray-500 mb-4">{new Date(order.createdAt).toLocaleString()}</div>
                {/* Admin/user cancel/deliver message */}
                {order.status === 'cancelled' && order.cancelledByAdmin && (
                  <div className="text-red-600 font-semibold mb-2">Your order is cancelled. You didn’t send the WhatsApp message for confirmation.</div>
                )}
                {order.status === 'cancelled' && !order.cancelledByAdmin && (
                  <div className="text-red-600 font-semibold mb-2">You cancelled this order</div>
                )}
                {order.status === 'delivered' && order.deliveredByAdmin && (
                  <div className="text-blue-600 font-semibold mb-2">Your order is delivered</div>
                )}
                <div className="space-y-4 mb-4">
                  {order.items.map((item: { product: { _id?: string; id?: string; image?: string; images?: Array<{ url: string; publicId: string; isThumbnail: boolean }>; name?: string }; quantity: number; price: number }) => (
                    <div key={item.product?._id || item.product?.id || item.product} className="flex items-center gap-10">
                      <img 
                        src={item.product?.images && item.product.images.length > 0
                          ? item.product.images.find(img => img.isThumbnail)?.url || item.product.images[0].url
                          : item.product?.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                        alt={item.product?.name} 
                        className="w-20 h-20 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-900">{item.product?.name}</div>
                        <div className="text-gray-600 text-base">Qty: {item.quantity} &bull; ₹{item.price} each</div>
                      </div>
                      <div className="font-bold text-xl text-gray-900">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-end mt-6 mb-2 gap-y-2">
                  <div className="font-bold text-xl text-gray-900">Total: ₹{order.total}</div>
                  {(activeTab === 'pending' || activeTab === 'active') && (
                    <button
                      onClick={() => setCancelOrderId(order._id)}
                      disabled={cancelling}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-semibold text-sm"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
                <ConfirmDialog
                  open={cancelOrderId === order._id}
                  title="Cancel Order?"
                  message="Are you sure you want to cancel this order?"
                  confirmText="Cancel Order"
                  cancelText="Keep Order"
                  onCancel={() => setCancelOrderId(null)}
                  onConfirm={() => handleCancelOrder(order._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 