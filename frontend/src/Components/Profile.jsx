import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  User, 
  Package, 
  LogOut, 
  Save,
  Trash2,
  Clock,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Edit2,
  ShoppingBag,
  X,
  IndianRupee,
  Home,
  User as UserIcon,
  Tag,
  Percent
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || "profile";
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gender: 'female'
  });

  // Get user_id from localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    return null;
  };

  const userId = getUserId();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated() || !userId) {
      navigate('/login');
      return;
    }
    
    fetchProfile();
    fetchOrders();
  }, [isAuthenticated, navigate, userId]);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await fetch(`https://admin.hogaacosmetics.com/api/auth/profile?user_id=${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setFormData({
          id: data.user.id,
          name: data.user.name || '',
          email: data.user.email || '',
          mobile: data.user.mobile || '',
          address: data.user.address || '',
          city: data.user.city || '',
          state: data.user.state || '',
          pincode: data.user.pincode || '',
          gender: data.user.gender || 'female'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch(`https://admin.hogaacosmetics.com/api/orders/my-orders?user_id=${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('data',data);
      
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch('https://admin.hogaacosmetics.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: userId,
          name: formData.name,
          mobile: formData.mobile,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gender: formData.gender
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...storedUser, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const getInitials = () => {
    if (!formData.name) return 'U';
    return formData.name.charAt(0).toUpperCase();
  };

  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return { color: '#28a745', icon: CheckCircle, label: 'Delivered' };
      case 'pending':
        return { color: '#ffc107', icon: Clock, label: 'Pending' };
      case 'processing':
        return { color: '#17a2b8', icon: Truck, label: 'Processing' };
      case 'shipped':
        return { color: '#17a2b8', icon: Truck, label: 'Shipped' };
      case 'cancelled':
        return { color: '#dc3545', icon: AlertCircle, label: 'Cancelled' };
      default:
        return { color: '#6c757d', icon: Clock, label: status || 'Placed' };
    }
  };

  const getOrderImageUrl = (imagePat, productImagePath) => {
    console.log('imagePath',imagePat);
    let imagePath  = imagePat || productImagePath;
    
    if (!imagePath) return 'https://via.placeholder.com/80x80?text=No+Image';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `https://admin.hogaacosmetics.com${imagePath}`;
    if (!imagePat) {
      return `https://admin.hogaacosmetics.com/uploads/products/${imagePath}`;
    }
    return `https://admin.hogaacosmetics.com/uploads/products/variations/${imagePath}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get product name with variation
  const getProductDisplayName = (item) => {console.log('item',item);
  
    let name = item.product_name || 'Product';
    if (item.variation_name) {
      name = `${name} (${item.variation_name})`;
    }
    return name;
  };

  // Calculate GST totals for an order
  const calculateOrderGST = (items) => {
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    
    items.forEach(item => {
      totalCgst += parseFloat(item.cgst_amount) || 0;
      totalSgst += parseFloat(item.sgst_amount) || 0;
      totalIgst += parseFloat(item.igst_amount) || 0;
    });
    
    return {
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      total: totalCgst + totalSgst + totalIgst
    };
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);
  
  return (
    <div className="profile-container">
      <div className="profile-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="user-brief">
            <div className="avatar">{getInitials()}</div>
            <div className="user-info">
              <p className="hello">Welcome back,</p>
              <h3 className="user-name">{formData.name || 'User'}</h3>
              <p className="user-email">{formData.email}</p>
            </div>
          </div>

          <nav className="profile-nav">
            <div 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} />
              Profile Information
            </div>
            <div 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} 
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} />
              My Orders
              {orders.length > 0 && <span className="nav-badge">{orders.length}</span>}
            </div>
            <div className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Logout
            </div>
          </nav>
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="profile-content">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <div className="header-title">
                  <User size={22} />
                  <h2>Personal Information</h2>
                </div>
                {!isEditing ? (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                ) : (
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                )}
              </div>
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              
              <div className="profile-stats">
                <div className="stat-card">
                  <ShoppingBag size={20} />
                  <div>
                    <span className="stat-value">{orders.length}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                </div>
                <div className="stat-card">
                  <Calendar size={20} />
                  <div>
                    <span className="stat-value">Member</span>
                    <span className="stat-label">Since {new Date().getFullYear()}</span>
                  </div>
                </div>
              </div>
              
              <div className="info-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled
                  />
                </div>
                
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="input-group">
                  <label>Gender</label>
                  <div className="radio-group">
                    <label className={formData.gender === 'male' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value="male"
                        checked={formData.gender === 'male'}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      /> 
                      Male
                    </label>
                    <label className={formData.gender === 'female' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value="female"
                        checked={formData.gender === 'female'}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      /> 
                      Female
                    </label>
                    <label className={formData.gender === 'other' ? 'active' : ''}>
                      <input 
                        type="radio" 
                        name="gender" 
                        value="other"
                        checked={formData.gender === 'other'}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      /> 
                      Other
                    </label>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <div className="section-header">
                  <MapPin size={18} />
                  <h3>Address Details</h3>
                </div>
                <div className="info-grid">
                  <div className="input-group full-width">
                    <label>Street Address</label>
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter your street address"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>State</label>
                    <input 
                      type="text" 
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="input-group">
                    <label>Pincode</label>
                    <input 
                      type="text" 
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <button 
                  className="save-btn" 
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}

              <div className="extra-info">
                <p><Calendar size={14} /> Member since: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="content-card">
              <div className="card-header">
                <div className="header-title">
                  <Package size={22} />
                  <h2>My Orders</h2>
                </div>
                <span className="order-count">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
              </div>

              {ordersLoading ? (
                <div className="orders-loading">
                  <div className="spinner"></div>
                  <p>Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <ShoppingBag size={64} />
                  <h3>No Orders Yet</h3>
                  <p>Looks like you haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/')} className="shop-now-btn">
                    Start Shopping
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const StatusIcon = getStatusConfig(order.order_status).icon;
                    const orderGST = calculateOrderGST(order.items);
                    
                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <span className="order-number">Order #{order.order_number}</span>
                            <span className="order-date">
                              <Clock size={14} />
                              {new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="order-status" style={{ backgroundColor: getStatusConfig(order.order_status).color }}>
                            <StatusIcon size={14} />
                            <span className="status-badge">
                              {getStatusConfig(order.order_status).label}
                            </span>
                          </div>
                        </div>

                        <div className="order-items">
                        
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="order-item">
                              <img 
                                src={getOrderImageUrl(item.variation_image, item.product_image)} 
                                alt={item.product_name}
                                className="order-item-img"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                }}
                              />
                              <div className="order-item-details">
                                <h4>{getProductDisplayName(item)}</h4>
                                <div className="order-item-meta">
                                  <span>Qty: {item.quantity}</span>
                                  <span>₹{Number(item.price).toLocaleString('en-IN')} each</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="more-items">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>

                        <div className="order-footer">
                          <div className="order-total-info">
                            <span>Total Amount:</span>
                            <strong>₹{Number(order.total).toLocaleString('en-IN')}</strong>
                          </div>
                          <button 
                            className="view-order-btn"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            View Details
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Order Details Modal with GST */}
      {isModalOpen && selectedOrder && (
        <div className="order-modal-overlay" onClick={closeModal}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h2>Order Details</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <div className="order-modal-content">
              {/* Order Info */}
              <div className="order-modal-section">
                <div className="order-modal-section-title">
                  <Package size={18} />
                  <span>Order Information</span>
                </div>
                <div className="order-modal-info-grid">
                  <div className="info-item">
                    <span className="info-label">Order Number:</span>
                    <span className="info-value">#{selectedOrder.order_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">{formatDate(selectedOrder.order_date || selectedOrder.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Status:</span>
                    <span className="info-value status">
                      {getStatusConfig(selectedOrder.order_status).label}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Payment Method:</span>
                    <span className="info-value">{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Items with variation names */}
              <div className="order-modal-section">
                <div className="order-modal-section-title">
                  <ShoppingBag size={18} />
                  <span>Items ({selectedOrder.items.length})</span>
                </div>
                <div className="order-modal-items">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-modal-item">
                      <img 
                        src={getOrderImageUrl(item.variation_image, item.product_image)} 
                        alt={item.product_name}
                        className="order-modal-item-img"
                      />
                      <div className="order-modal-item-details">
                        <h4>{getProductDisplayName(item)}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{Number(item.price).toLocaleString('en-IN')} each</p>
                        <p className="item-total">Total: ₹{Number(item.total).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary with GST Breakdown */}
              <div className="order-modal-section">
                <div className="order-modal-section-title">
                  <IndianRupee size={18} />
                  <span>Price Summary</span>
                </div>
                <div className="order-modal-price-summary">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                  </div>
                  
                  {/* GST Breakdown */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="gst-breakdown">
                      <div className="price-row gst-row">
                        <span>CGST</span>
                        <span>₹{selectedOrder.items.reduce((sum, item) => sum + (Number(item.cgst_amount) || 0), 0).toFixed(2)}</span>
                      </div>
                      <div className="price-row gst-row">
                        <span>SGST</span>
                        <span>₹{selectedOrder.items.reduce((sum, item) => sum + (Number(item.sgst_amount) || 0), 0).toFixed(2)}</span>
                      </div>
                      {selectedOrder.items.reduce((sum, item) => sum + (Number(item.igst_amount) || 0), 0) > 0 && (
                        <div className="price-row gst-row">
                          <span>IGST</span>
                          <span>₹{selectedOrder.items.reduce((sum, item) => sum + (Number(item.igst_amount) || 0), 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-row total-tax-row">
                        <span>Total Tax (GST)</span>
                        <span>₹{selectedOrder.items.reduce((sum, item) => sum + (Number(item.cgst_amount) || 0) + (Number(item.sgst_amount) || 0) + (Number(item.igst_amount) || 0), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="price-row">
                    <span>Shipping</span>
                    <span>{Number(selectedOrder.shipping_charge) === 0 ? 'FREE' : `₹${selectedOrder.shipping_charge}`}</span>
                  </div>
                  
                  <div className="price-divider"></div>
                  
                  <div className="price-row total">
                    <span>Total Amount</span>
                    <span>₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="order-modal-section">
                <div className="order-modal-section-title">
                  <MapPin size={18} />
                  <span>Shipping Address</span>
                </div>
                <div className="order-modal-address">
                  <p><strong>{selectedOrder.shipping_name || 'Customer'}</strong></p>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
                  <p><Phone size={14} /> {selectedOrder.shipping_phone}</p>
                  <p><Mail size={14} /> {selectedOrder.shipping_email || formData.email}</p>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button className="modal-close-footer-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;