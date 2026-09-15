import emailjs from '@emailjs/browser';
import { Order, OrderStatus } from '../types';

export interface StatusEmailParams {
  order: Order;
  newStatus: OrderStatus;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  customMessage?: string;
}

// Generate human-friendly subject and headline for order status emails
export const getStatusEmailDetails = (
  orderId: string,
  newStatus: OrderStatus,
  courierPartner?: string,
  trackingNumber?: string
) => {
  switch (newStatus) {
    case 'Shipped':
      return {
        subject: `🚚 Shipped! Your NIRA Order #${orderId} is on its way`,
        headline: 'Your pure coconut oil package has been dispatched!',
        message: courierPartner
          ? `Your fresh batch of NIRA Pure Coconut Oil has been hand-inspected, packed with UV-protection, and handed over to ${courierPartner}${trackingNumber ? ` (AWB #${trackingNumber})` : ''}.`
          : 'Your order has been packed and handed over to our express courier partner for speedy delivery to your doorstep.'
      };
    case 'Delivered':
      return {
        subject: `✨ Delivered! Your NIRA Order #${orderId} has arrived`,
        headline: 'Your NIRA Pure Coconut Oil package has been delivered!',
        message: 'Your order has been delivered successfully. We hope you cherish the natural aroma, unbleached purity, and therapeutic richness of our traditional Kerala cold-pressed coconut oil.'
      };
    case 'Processing':
      return {
        subject: `🌱 In Processing: Your NIRA Order #${orderId} is being prepared`,
        headline: 'Your order is currently being prepared at our Kozhikode facility.',
        message: 'Our artisans are verifying your cold-pressed coconut oil bottles for airtight sealing and quality control before dispatch.'
      };
    case 'Packed':
      return {
        subject: `📦 Packed & Ready: Your NIRA Order #${orderId}`,
        headline: 'Your package is packed and awaiting courier pickup.',
        message: 'Your bottles are securely cushioned in recyclable, tamper-evident packaging.'
      };
    case 'Out for Delivery':
      return {
        subject: `🛵 Out for Delivery: NIRA Order #${orderId}`,
        headline: 'Your package is out for delivery today!',
        message: 'The delivery executive is nearby. Please ensure someone is available at the delivery location.'
      };
    case 'Cancelled':
      return {
        subject: `Notice: NIRA Order #${orderId} Cancelled`,
        headline: 'Your order has been cancelled.',
        message: 'Your order has been cancelled. Any pre-authorized online payments will be refunded to your original source within 3-5 business days.'
      };
    default:
      return {
        subject: `Status Update: NIRA Order #${orderId} is now ${newStatus}`,
        headline: `Your order status has been updated to ${newStatus}.`,
        message: `Your order #${orderId} is now marked as ${newStatus}.`
      };
  }
};

// EmailJS service helper for automated order confirmation emails
export const sendOrderConfirmationEmail = async (order: Order, customerEmail: string, customerName: string) => {
  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nira_oil';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_order_confirm';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    if (!publicKey) {
      console.log('EmailJS Public Key not configured. Order confirmation simulated for:', customerEmail);
      return { success: true, simulated: true };
    }

    const itemsSummary = order.items.map(i => `${i.name} (${i.size} x ${i.quantity}) - ₹${((i as any).price || (i as any).unitPrice || 0) * i.quantity}`).join('\n');
    const deliveryAddress = `${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}`;

    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      order_id: order.orderId,
      order_date: new Date(order.createdAt).toLocaleString('en-IN'),
      order_items: itemsSummary,
      total_amount: `₹${order.totalAmount}`,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      shipping_address: deliveryAddress,
      support_phone: '+91 98460 12345',
      company_name: 'NIRA Pure Coconut Oil'
    };

    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Order confirmation email sent successfully via EmailJS:', response.status, response.text);
    return { success: true, simulated: false };
  } catch (error) {
    console.error('Failed to send automated order confirmation email:', error);
    return { success: false, error };
  }
};

// Automated Status Update Email Trigger for Customers
export const sendStatusUpdateEmail = async ({
  order,
  newStatus,
  courierPartner,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  customMessage
}: StatusEmailParams) => {
  const customerEmail = order.email || order.shippingAddress?.email;
  const customerName = order.customerName || order.shippingAddress?.fullName || 'Valued Customer';
  const { subject, headline, message } = getStatusEmailDetails(
    order.orderId,
    newStatus,
    courierPartner,
    trackingNumber
  );

  try {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_nira_oil';
    const templateId = import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID || 'template_status_update';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    const itemsSummary = order.items.map(i => `${i.name} (${i.size} × ${i.quantity}) — ₹${i.totalPrice || i.unitPrice * i.quantity}`).join('\n');
    const deliveryAddress = `${order.shippingAddress?.house || ''}, ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pinCode || ''}`;

    const templateParams = {
      to_email: customerEmail,
      to_name: customerName,
      order_id: order.orderId,
      status: newStatus,
      status_headline: headline,
      status_message: customMessage || message,
      courier_partner: courierPartner || 'Standard Express Courier',
      tracking_number: trackingNumber || 'N/A',
      tracking_url: trackingUrl || `${window.location.origin}/track?orderId=${order.orderId}`,
      estimated_delivery: estimatedDelivery || order.estimatedDelivery || '3 to 5 business days',
      total_amount: `₹${order.totalAmount}`,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      shipping_address: deliveryAddress,
      order_items: itemsSummary,
      support_phone: '+91 98460 12345',
      support_email: 'care@niraoils.com',
      company_name: 'NIRA Pure Coconut Oil (Kerala)'
    };

    if (!publicKey) {
      console.log(`[AUTOMATIC STATUS EMAIL TRIGGERED]
To: ${customerEmail} (${customerName})
Subject: ${subject}
Status: ${newStatus}
Courier: ${courierPartner || 'N/A'} | Tracking: ${trackingNumber || 'N/A'}
Delivery: ${estimatedDelivery || order.estimatedDelivery}`);
      return {
        success: true,
        simulated: true,
        subject,
        recipient: customerEmail,
        timestamp: new Date().toISOString()
      };
    }

    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Status update email sent via EmailJS:', response.status, response.text);
    return {
      success: true,
      simulated: false,
      subject,
      recipient: customerEmail,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('EmailJS delivery fallback (logged locally):', error);
    return {
      success: true,
      simulated: true,
      subject,
      recipient: customerEmail,
      timestamp: new Date().toISOString()
    };
  }
};

