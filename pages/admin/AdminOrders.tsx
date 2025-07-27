import React, { useEffect, useState } from 'react';
import apiService from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const ORDER_TABS = [
  { id: 'pending', label: { full: 'Pending Orders', medium: 'Pending', short: '' }, icon: <Clock className="w-5 h-5" /> },
  { id: 'active', label: { full: 'Active Orders', medium: 'Active', short: '' }, icon: <Truck className="w-5 h-5" /> },
  { id: 'delivered', label: { full: 'Delivered Orders', medium: 'Delivered', short: '' }, icon: <CheckCircle className="w-5 h-5" /> },
  { id: 'cancelled', label: { full: 'Cancelled Orders', medium: 'Cancelled', short: '' }, icon: <XCircle className="w-5 h-5" /> },
];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionOrder, setActionOrder] = useState<{ id: string; action: 'cancel' | 'deliver' | 'confirm' | null } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'delivered' | 'cancelled'>('active');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.getAllOrders();
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

  const handleCancelOrder = async (orderId: string) => {
    setProcessing(true);
    try {
      const res = await apiService.adminCancelOrder(orderId); // expects { order, message }
      setOrders(orders => orders.map(o => o._id === orderId ? res.order : o));
      showSuccess('Order Cancelled', 'Order has been cancelled. Please notify the user via WhatsApp.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        showError('Cancel Failed', e.message || 'Failed to cancel order');
      } else {
        showError('Cancel Failed', 'Failed to cancel order');
      }
    }
    setProcessing(false);
    setActionOrder(null);
  };

  const handleDeliverOrder = async (orderId: string) => {
    setProcessing(true);
    try {
      const res = await apiService.markOrderDelivered(orderId); // expects updated order
      setOrders(orders => orders.map(o => o._id === orderId ? res : o));
      showSuccess('Order Delivered', 'Order marked as delivered.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        showError('Delivery Failed', e.message || 'Failed to mark as delivered');
      } else {
        showError('Delivery Failed', 'Failed to mark as delivered');
      }
    }
    setProcessing(false);
    setActionOrder(null);
  };

  const handleConfirmOrder = async (orderId: string) => {
    setProcessing(true);
    try {
      const res = await apiService.confirmOrder(orderId, 'active');
      setOrders(orders => orders.map(o => o._id === orderId ? res : o));
      showSuccess('Order Confirmed', 'Order has been confirmed and is now active.');
    } catch (e: unknown) {
      if (e instanceof Error) {
        showError('Confirm Failed', e.message || 'Failed to confirm order');
      } else {
        showError('Confirm Failed', 'Failed to confirm order');
      }
    }
    setProcessing(false);
    setActionOrder(null);
  };

  // Divide orders by status
  const pendingOrders = orders.filter(order => String(order.status) === 'pending');
  const activeOrders = orders.filter(order => String(order.status) !== 'cancelled' && String(order.status) !== 'delivered' && String(order.status) !== 'pending');
  const deliveredOrders = orders.filter(order => String(order.status) === 'delivered');
  const cancelledOrders = orders.filter(order => String(order.status) === 'cancelled');

  let displayedOrders = activeOrders;
  let emptyText = 'No active orders.';
  if (String(activeTab) === 'pending') {
    displayedOrders = pendingOrders;
    emptyText = 'No pending orders.';
  } else if (String(activeTab) === 'delivered') {
    displayedOrders = deliveredOrders;
    emptyText = 'No delivered orders.';
  } else if (String(activeTab) === 'cancelled') {
    displayedOrders = cancelledOrders;
    emptyText = 'No cancelled orders.';
  }

  // Filter by search
  const searchLower = search.trim().toLowerCase();
  if (searchLower) {
    displayedOrders = displayedOrders.filter(order => {
      const orderNo = (order._id ? String(order._id) : '').slice(-6).toLowerCase();
      let username = '';
      let email = '';
      if (order.user && typeof order.user === 'object') {
        if ('name' in order.user && typeof (order.user as Record<string, unknown>).name === 'string') {
          username = (order.user as Record<string, unknown>).name.toLowerCase();
        }
        if ('email' in order.user && typeof (order.user as Record<string, unknown>).email === 'string') {
          email = (order.user as Record<string, unknown>).email.toLowerCase();
        }
      }
      return (
        orderNo.includes(searchLower) ||
        username.includes(searchLower) ||
        email.includes(searchLower)
      );
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">All Orders</h2>
      {/* Search Bar (copied from ProductsTab, centered, after All Orders heading) */}
      <div className="bg-white rounded-2xl shadow-md mx-auto w-full max-w-5xl px-2 py-2 sm:px-6 sm:py-4 flex flex-col gap-2 sm:gap-4 mb-6">
        <div className="flex flex-row items-center w-full gap-2 sm:gap-4">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Order #, Username, or Email"
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg bg-white text-base placeholder-gray-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>
        </div>
      </div>
      {/* Horizontal Tabs */}
      <div className="flex flex-row flex-nowrap justify-center items-center gap-x-4 md:gap-x-6 lg:gap-x-8 mb-8 border-b border-gray-200 hide-scrollbar w-full min-w-0" style={{whiteSpace: 'nowrap'}}>
        {ORDER_TABS.map(tab => {
          let count = 0;
          if (tab.id === 'pending') count = pendingOrders.length;
          if (tab.id === 'active') count = activeOrders.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'active' | 'delivered' | 'cancelled')}
              className={`flex-shrink-0 min-w-0 py-3 px-3 md:px-4 lg:px-5 mx-2 md:mx-3 lg:mx-4 text-base md:text-lg font-semibold focus:outline-none transition-colors border-b-2 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-transparent text-gray-600 hover:text-emerald-600'} rounded-t-xl md:rounded-t-2xl flex items-center justify-center gap-2`}
              style={{ minWidth: 0 }}
            >
              <span className="block md:hidden relative">{tab.icon}
                {(tab.id === 'pending' || tab.id === 'active') && count > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-10px',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '0.75em',
                    fontWeight: 700,
                    padding: '2px 6px',
                    minWidth: '18px',
                    display: 'inline-block',
                    lineHeight: 1,
                  }}>{count}</span>
                )}
              </span>
              <span className="hidden md:flex lg:hidden items-center gap-2">{tab.icon} {tab.label.medium}{(tab.id === 'pending' || tab.id === 'active') && count > 0 && (
                <span style={{ marginLeft: 4, color: '#ef4444', fontWeight: 700, fontSize: '0.95em' }}>({count})</span>
              )}</span>
              <span className="hidden lg:flex items-center gap-2">{tab.icon} {tab.label.full}{(tab.id === 'pending' || tab.id === 'active') && count > 0 && (
                <span style={{ marginLeft: 4, color: '#ef4444', fontWeight: 700, fontSize: '0.95em' }}>({count})</span>
              )}</span>
            </button>
          );
        })}
      </div>
      {loading ? (
        <div className="text-gray-500">Loading orders...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <>
          {displayedOrders.length === 0 ? (
            <div className="text-gray-500 font-bold text-xl text-center py-12">{emptyText}</div>
          ) : (
            <div className="space-y-8">
              {displayedOrders.map(order => (
                <div key={order._id ? String(order._id) : Math.random().toString()} className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-4 flex flex-col gap-4">
                  <div className="flex flex-row items-start justify-between gap-2">
                    <div className="font-semibold text-lg sm:text-xl text-gray-800 break-all">Order #{order._id ? String(order._id).slice(-6).toUpperCase() : ''}</div>
                    <div className="flex flex-col items-end gap-1 sm:gap-2 min-w-[110px]">
                      <span className={
                        String(order.status) === 'pending' ? 'px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700' :
                        String(order.status) === 'active' ? 'px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700' :
                        String(order.status) === 'delivered' ? 'px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700' :
                        String(order.status) === 'cancelled' ? 'px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-500' : ''
                      }>
                        {String(order.status) === 'pending' ? 'Pending' : String(order.status) === 'active' ? 'Active' : String(order.status) === 'delivered' ? 'Delivered' : String(order.status) === 'cancelled' ? 'Cancelled' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="mb-2 text-base">
                    <div><span className="text-gray-700">Username:</span> <span className="font-bold text-gray-900">{order.user && typeof order.user === 'object' && 'name' in order.user && typeof (order.user as Record<string, unknown>).name === 'string' ? (order.user as Record<string, unknown>).name : ''}</span></div>
                    <div><span className="text-gray-700">Email:</span> <span className="font-bold text-gray-900">{order.user && typeof order.user === 'object' && 'email' in order.user && typeof (order.user as Record<string, unknown>).email === 'string' ? (order.user as Record<string, unknown>).email : ''}</span></div>
                    {/* Show message if cancelled by user (not admin) */}
                    {String(order.status) === 'cancelled' && order.cancelledByAdmin === false && order.user && typeof order.user === 'object' && 'name' in order.user && typeof (order.user as Record<string, unknown>).name === 'string'
                      ? (<span className="block text-base text-red-600 font-bold mt-1">This order is cancelled by {(order.user as Record<string, unknown>).name}</span>)
                      : null}
                  </div>
                  <div className="text-base text-gray-500 mb-2">
                    Placed: {(typeof order.createdAt === 'string' || typeof order.createdAt === 'number') ? new Date(order.createdAt).toLocaleString() : ''}
                    {String(order.status) === 'delivered' && (typeof order.deliveredAt === 'string' || typeof order.deliveredAt === 'number') && (
                      <div>Delivered: {new Date(order.deliveredAt).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="space-y-4 mb-4">
                    {Array.isArray(order.items) ? order.items.map((item: Record<string, unknown>) => {
                      const productKey = item.product?._id || item.product?.id || '';
                      return (
                        <div key={String(productKey)}>
                          {/* Mobile: image left, details right; Desktop: image left, details right */}
                          <div className="flex flex-row items-center gap-4 sm:gap-10">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                              <img 
                                src={item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0
                                  ? item.product.images.find((img: any) => img.isThumbnail)?.url || item.product.images[0].url
                                  : item.product?.image || 'https://via.placeholder.com/80x80?text=No+Image'} 
                                alt={item.product?.name} 
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center sm:gap-10">
                              <div className="flex-1">
                                <div className="font-semibold text-base sm:text-lg text-gray-900 break-words">{item.product?.name}</div>
                                <div className="text-gray-600 text-xs sm:text-base">Qty: {item.quantity} &bull; ₹{item.price} each</div>
                              </div>
                              <div className="font-bold text-base sm:text-xl text-gray-900 mt-2 sm:mt-0">₹{item.price * item.quantity}</div>
                            </div>
                          </div>
                        </div>
                      );
                    }) : null}
                  </div>
                  <div className="flex flex-row flex-wrap sm:flex-row sm:items-center sm:justify-end gap-2 mt-4 mb-2 w-full">
                    <div className="font-bold text-base sm:text-xl text-gray-900 sm:mr-6">Total: ₹{order.total !== undefined ? String(order.total) : ''}</div>
                    {String(order.status) === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActionOrder({ id: String(order._id), action: 'confirm' })}
                          disabled={processing}
                          className="px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition font-semibold text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setActionOrder({ id: String(order._id), action: 'cancel' })}
                          disabled={processing}
                          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-semibold text-sm"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                    {String(order.status) === 'active' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActionOrder({ id: String(order._id), action: 'cancel' })}
                          disabled={processing}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition font-semibold text-sm"
                        >
                          Cancel Order
                        </button>
                        <button
                          onClick={() => setActionOrder({ id: String(order._id), action: 'deliver' })}
                          disabled={processing}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition font-semibold text-sm"
                        >
                          Mark as Delivered
                        </button>
                      </div>
                    )}
                  </div>
                  <ConfirmDialog
                    open={!!actionOrder && actionOrder.id === order._id}
                    title={actionOrder?.action === 'cancel' ? 'Cancel Order?' : actionOrder?.action === 'confirm' ? 'Confirm Order?' : 'Mark as Delivered?'}
                    message={actionOrder?.action === 'cancel' ? 'Are you sure you want to cancel this order? Please notify the user via WhatsApp.' : actionOrder?.action === 'confirm' ? 'Are you sure you want to confirm this order?' : 'Mark this order as delivered?'}
                    confirmText={actionOrder?.action === 'cancel' ? 'Cancel Order' : actionOrder?.action === 'confirm' ? 'Confirm Order' : 'Mark Delivered'}
                    cancelText="Close"
                    onCancel={() => setActionOrder(null)}
                    onConfirm={() => {
                      if (actionOrder?.action === 'cancel') handleCancelOrder(String(order._id));
                      else if (actionOrder?.action === 'confirm') handleConfirmOrder(String(order._id));
                      else if (actionOrder?.action === 'deliver') handleDeliverOrder(String(order._id));
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;