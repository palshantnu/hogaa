import React, { useEffect, useState } from "react";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(data);
  }, []);

  if (orders.length === 0) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>No Orders Yet 😢</h2>;
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">MY ORDERS</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">

          {/* Order Header */}
          <div className="order-header">
            <div>
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Date:</strong> {order.date}</p>
            </div>

            <div className="order-status">
              {order.status}
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item">

                <div className="order-item-left">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p className="item-name">{item.name}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                </div>

                <div className="order-item-price">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>

              </div>
            ))}
          </div>

          {/* Total */}
          <div className="order-footer">
            <span>Total:</span>
            <span className="order-total">₹{order.total.toFixed(2)}</span>
          </div>

        </div>
      ))}
    </div>
  );
};

export default Orders;