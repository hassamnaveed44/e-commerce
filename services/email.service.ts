import nodemailer from "nodemailer";

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderDate?: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    country?: string;
    postalCode: string;
    phone?: string;
  };
  items: {
    name: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    lineTotal?: number;
  }[];
}

export type EmailType = "CONFIRMATION" | "STATUS_UPDATE" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Create SMTP Transporter or return null if unconfigured
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendOrderNotificationEmail({
  order,
  type = "CONFIRMATION",
  newStatus,
  previousStatus,
}: {
  order: OrderEmailData;
  type?: EmailType;
  newStatus?: string;
  previousStatus?: string;
}) {
  try {
    const recipientEmail = order.customerEmail;
    if (!recipientEmail || recipientEmail.includes("@guest.shop.co")) {
      console.log(`[Email Service] Skipping email for guest placeholder: ${recipientEmail}`);
      return { success: false, reason: "Invalid or guest placeholder email" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e-commerce-hassam-dev.vercel.app";
    const fromAddress = process.env.EMAIL_FROM || '"SHOP.CO" <orders@shop.co>';

    // Determine subject & header badge based on status or type
    const status = (newStatus || order.orderStatus || "PROCESSING").toUpperCase();
    let subject = `Order Confirmation #${order.orderNumber} - SHOP.CO`;
    let statusTitle = "Order Confirmed & Processing";
    let statusMessage = "Thank you for your order! We have received your purchase and our fulfillment team is preparing your package.";
    let statusColor = "#10B981"; // Emerald

    if (status === "SHIPPED" || type === "SHIPPED") {
      subject = `Your Order #${order.orderNumber} Has Shipped! 📦 - SHOP.CO`;
      statusTitle = "Your Package is on the Way!";
      statusMessage = "Great news! Your package has been dispatched from our warehouse and is traveling to your delivery address.";
      statusColor = "#3B82F6"; // Blue
    } else if (status === "DELIVERED" || type === "DELIVERED") {
      subject = `Delivered: Your Order #${order.orderNumber} Has Arrived! 🎉 - SHOP.CO`;
      statusTitle = "Package Delivered Successfully!";
      statusMessage = "Your order has been delivered! We hope you love your new apparel. Feel free to leave a product review.";
      statusColor = "#059669"; // Green
    } else if (status === "CANCELLED" || type === "CANCELLED") {
      subject = `Order #${order.orderNumber} Cancellation Notice - SHOP.CO`;
      statusTitle = "Order Cancelled";
      statusMessage = "Your order has been cancelled and any reserved items have been returned to stock. If you need assistance, please contact our support.";
      statusColor = "#EF4444"; // Red
    }

    const itemsRowsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #EEEEEE; text-align: left;">
            <strong style="color: #111111; font-size: 14px;">${item.name}</strong>
            ${item.size || item.color ? `<br/><span style="color: #666666; font-size: 12px;">Variant: ${[item.size, item.color].filter(Boolean).join(" / ")}</span>` : ""}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #EEEEEE; text-align: center; color: #555555; font-size: 14px;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #EEEEEE; text-align: right; color: #111111; font-size: 14px; font-weight: 600;">
            $${(Number(item.unitPrice) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const discountRowHtml =
      order.discount && order.discount > 0
        ? `
        <tr>
          <td style="padding: 6px 0; color: #16A34A; font-size: 13px; font-weight: 600;">Discount / Promo Savings</td>
          <td style="padding: 6px 0; text-align: right; color: #16A34A; font-size: 13px; font-weight: 600;">-$${Number(order.discount).toFixed(2)}</td>
        </tr>
      `
        : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 24px 12px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Brand Header -->
          <div style="background-color: #000000; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">SHOP.CO</h1>
            <p style="color: #9CA3AF; margin: 4px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Official Order Receipt & Update</p>
          </div>

          <!-- Status Banner -->
          <div style="padding: 24px 28px 16px 28px; text-align: left;">
            <div style="display: inline-block; background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: bold; margin-bottom: 12px;">
              ● ${statusTitle}
            </div>
            <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 800;">Hello, ${order.customerName || "Customer"}!</h2>
            <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">${statusMessage}</p>
          </div>

          <!-- Order Summary Meta -->
          <div style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; padding: 16px 28px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #6B7280;">Order Number:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #111827;">#${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6B7280;">Order Date:</td>
                <td style="padding: 4px 0; text-align: right; color: #374151;">${order.orderDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6B7280;">Payment Method:</td>
                <td style="padding: 4px 0; text-align: right; color: #374151; font-weight: 600;">${order.paymentMethod || "Credit Card (Stripe)"}</td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <div style="padding: 0 28px 20px 28px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #111827;">Purchased Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #F3F4F6;">
                  <th style="padding: 8px; text-align: left; font-size: 12px; color: #6B7280; text-transform: uppercase;">Item</th>
                  <th style="padding: 8px; text-align: center; font-size: 12px; color: #6B7280; text-transform: uppercase;">Qty</th>
                  <th style="padding: 8px; text-align: right; font-size: 12px; color: #6B7280; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <!-- Financial Breakdown -->
            <div style="margin-top: 16px; border-top: 1px solid #E5E7EB; padding-top: 12px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #111827; font-size: 13px; font-weight: 600;">$${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                ${discountRowHtml}
                <tr>
                  <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Delivery Fee</td>
                  <td style="padding: 4px 0; text-align: right; color: #111827; font-size: 13px; font-weight: 600;">$${Number(order.deliveryFee).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; color: #111827; font-size: 16px; font-weight: 800; border-top: 2px solid #111827;">Total Paid</td>
                  <td style="padding: 10px 0 0 0; text-align: right; color: #111827; font-size: 18px; font-weight: 900; border-top: 2px solid #111827;">$${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #F9FAFB; padding: 20px 28px; border-top: 1px solid #E5E7EB;">
            <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #6B7280; letter-spacing: 0.5px;">Shipping Address</h4>
            <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.5;">
              <strong>${order.customerName}</strong><br/>
              ${order.shippingAddress.street}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state || ""} ${order.shippingAddress.postalCode}<br/>
              ${order.shippingAddress.country || "United States"}<br/>
              ${order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : ""}
            </p>
          </div>

          <!-- Footer / CTA -->
          <div style="padding: 24px; text-align: center; background-color: #FFFFFF;">
            <a href="${appUrl}/account" style="display: inline-block; background-color: #000000; color: #FFFFFF; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              View Order in Account
            </a>
            <p style="margin: 20px 0 0 0; color: #9CA3AF; font-size: 11px;">
              SHOP.CO E-Commerce Platform • If you have questions, please reach out to support.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    if (transporter) {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Service] Sent order notification email to ${recipientEmail} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Email Service] (Preview Mode - SMTP keys not configured) Order notification generated for: ${recipientEmail}`);
      console.log(`[Email Service] Subject: ${subject}`);
      return { success: true, preview: true };
    }
  } catch (error) {
    console.error("[Email Service Error] Failed to send order email:", error);
    return { success: false, error };
  }
}
