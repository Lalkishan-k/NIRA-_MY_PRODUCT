import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    freeShippingRemaining
  } = useCart();
  const { settings } = useStore();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              <h2 className="font-serif text-lg font-bold text-stone-900">Your Basket ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100 text-xs">
            {freeShippingRemaining > 0 ? (
              <div className="space-y-1.5">
                <p className="text-emerald-900 font-medium flex items-center justify-between">
                  <span>Add ₹{freeShippingRemaining} more for FREE Delivery!</span>
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                </p>
                <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((settings.freeShippingThreshold - freeShippingRemaining) / settings.freeShippingThreshold) * 100)}%`
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <span>🎉</span> You qualify for FREE Delivery across India!
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-stone-800">Your basket is currently empty</p>
                  <p className="text-xs text-stone-500 mt-1">Explore our cold pressed coconut oils and family packs.</p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="px-6 py-2.5 bg-emerald-800 text-white rounded-full text-xs font-semibold hover:bg-emerald-900 transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={`${item.productId}-${item.size}`} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-100 bg-stone-50 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-900 truncate">{item.name}</h3>
                    <p className="text-xs text-stone-500">{item.size}</p>
                    <p className="text-sm font-bold text-emerald-900 mt-1">₹{item.unitPrice}</p>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-stone-100 bg-stone-50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-600">Subtotal:</span>
                <span className="font-bold text-stone-900 text-lg">₹{subtotal}</span>
              </div>
              <p className="text-[11px] text-stone-500">Shipping, discounts & taxes calculated at checkout.</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-3 px-4 border border-stone-300 hover:border-stone-400 text-stone-800 font-semibold text-xs rounded-xl text-center transition-colors"
                >
                  View Full Cart
                </button>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
