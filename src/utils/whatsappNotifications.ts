import { Order, AbandonedCheckout } from '../types';

/**
 * Normalizes an Indian or international phone number for WhatsApp URL.
 * Removes spaces, hyphens, and prepends 91 if it's a 10-digit Indian number.
 */
export function formatPhoneNumberForWhatsApp(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `91${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Builds a direct WhatsApp Web / App intent URL with encoded text.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumberForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  if (formattedPhone) {
    return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Opens WhatsApp in a clean new browser tab.
 */
export function openWhatsAppDirect(phone: string, message: string): void {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Generates formatted WhatsApp messages for each order lifecycle status.
 */
export function generateOrderWhatsAppMessage(order: Order, type: 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'): string {
  const customerName = order.customerName || 'Valued Customer';
  const orderNumber = order.orderId || order.id;
  const itemsSummary = order.items
    .map((item) => `• ${item.name} (${item.size}) × ${item.quantity} = ₹${item.totalPrice}`)
    .join('\n');
  const appBaseUrl = window.location.origin;
  const trackingUrl = `${appBaseUrl}/track?orderId=${encodeURIComponent(orderNumber)}`;

  switch (type) {
    case 'CONFIRMED':
      return `🥥 *NIRA PURE COCONUT OIL — ORDER CONFIRMED*

Hello *${customerName}*,

Thank you for choosing 100% Pure, Unfiltered Kerala Coconut Oil! Your order *#${orderNumber}* has been confirmed.

📦 *Order Details:*
${itemsSummary}

💰 *Total Amount:* ₹${order.totalAmount} (${order.paymentMethod} - ${order.paymentStatus})
📍 *Delivering to:* ${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}
🚚 *Estimated Delivery:* ${order.estimatedDelivery || '3 to 5 business days'}

🔍 *Track Order Live:*
${trackingUrl}

We are preparing your fresh cold-press batch from our Kozhikode extraction facility!

— *NIRA Pure Coconut Oil, Kerala*
📞 Helpline: +91 94471 23456`;

    case 'PACKED':
      return `🥥 *NIRA PURE COCONUT OIL — ORDER PACKED*

Hello *${customerName}*,

Great news! Your order *#${orderNumber}* has been freshly bottled in UV-safe packaging and sealed for transit.

📦 *Items Packed:*
${itemsSummary}

Our logistics team is handing it over to the express courier partner.

🔍 *Live Tracking:* ${trackingUrl}

— *NIRA Pure Coconut Oil Team*`;

    case 'DISPATCHED':
      return `🚚 *NIRA PURE COCONUT OIL — ORDER DISPATCHED*

Hello *${customerName}*,

Your order *#${orderNumber}* is on its way! 

📦 *Shipment Details:*
• *Courier Partner:* ${order.courierPartner || 'Kerala Express / Delhivery Air'}
• *AWB Tracking No:* ${order.trackingNumber || 'NIRA-EXP-' + orderNumber.replace(/\D/g, '')}
• *Live Tracking Link:* ${order.trackingUrl || trackingUrl}

📍 *Destination:* ${order.shippingAddress.city}, ${order.shippingAddress.state} (${order.shippingAddress.pinCode})
📅 *Estimated Arrival:* ${order.estimatedDelivery || 'Within 2 to 3 Days'}

Please ensure someone is available at the delivery address.

— *NIRA Pure Coconut Oil*
📞 Questions? Reply directly to this WhatsApp message.`;

    case 'OUT_FOR_DELIVERY':
      return `🛵 *NIRA ORDER OUT FOR DELIVERY TODAY!*

Hello *${customerName}*,

Your fresh Kerala coconut oil package for order *#${orderNumber}* is out for delivery today with our local courier partner.

📍 *Delivery Address:* ${order.shippingAddress.house}, ${order.shippingAddress.city}
💰 *Payment Method:* ${order.paymentMethod} (${order.paymentStatus})

${order.paymentMethod.includes('COD') ? '⚠️ *Reminder:* Please keep exact cash of ₹' + order.totalAmount + ' ready for the courier agent.\n' : ''}
🔍 *Track Live:* ${trackingUrl}

Enjoy the authentic taste & aroma of unfiltered pure coconut oil!

— *NIRA Team*`;

    case 'DELIVERED':
      return `✨ *NIRA ORDER DELIVERED — THANK YOU!*

Hello *${customerName}*,

Your order *#${orderNumber}* has been successfully delivered. We hope you love the rich aroma and purity of our traditional Kerala wood-pressed coconut oil!

🌿 *Storage & Purity Note:*
• Store in a cool, dry place away from direct sunlight.
• Natural sediment at the bottom and cloudiness in winter is proof of 100% unrefined purity!

⭐ *We Value Your Feedback:*
How was your experience? Leave a review and earn 50 Coconut Coins for your next order:
${appBaseUrl}/product/nira-pure-coconut-oil-500ml#reviews

— *With gratitude, Team NIRA*
📞 Helpline: +91 94471 23456`;
  }
}

/**
 * Generates an Abandoned Checkout Recovery WhatsApp message with special promo code.
 */
export function generateAbandonedRecoveryMessage(abandoned: AbandonedCheckout): string {
  const customerName = abandoned.customerName || 'there';
  const itemsText = abandoned.items
    .map((item) => `• ${item.name} (${item.size}) × ${item.quantity}`)
    .join('\n');
  const appBaseUrl = window.location.origin;
  const recoveryUrl = `${appBaseUrl}/checkout?recover=${encodeURIComponent(abandoned.recoveryToken)}`;

  return `🥥 *Hello ${customerName}, you left something pure in your cart!*

We noticed you started ordering 100% Pure Unfiltered Kerala Coconut Oil from *NIRA*, but didn't get a chance to complete your checkout.

🛒 *Your Saved Basket:*
${itemsText}
💰 *Subtotal:* ₹${abandoned.subtotal}

🎁 *Special Exclusive Gift for You:*
Use coupon code *RECOVER10* at checkout for an extra *10% OFF* + *Free Express Shipping*!

👉 *1-Click Complete Your Order Here:*
${recoveryUrl}

Our current batch is fresh from the Kozhikode mill. We have reserved your bottles for the next 24 hours.

If you have any questions or need help with payment, simply reply to this WhatsApp message!

— *Lal Kishan & Team NIRA*
📍 Kozhikode, Kerala`;
}

/**
 * Generates a customer-initiated tracking inquiry WhatsApp message.
 */
export function generateCustomerTrackingInquiryMessage(orderId: string): string {
  return `Hello NIRA Team, I would like to know the live dispatch status for my order *#${orderId}*. Please assist!`;
}
