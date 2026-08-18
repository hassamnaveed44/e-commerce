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

// Create SMTP Transporter with smart Gmail and STARTTLS detection
export function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  // Strip all whitespace from app passwords (e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = rawPass ? rawPass.replace(/\s+/g, "").trim() : undefined;

  if (user && pass) {
    // If Gmail host or Gmail user, use Gmail service for 100% reliable connection
    if (host?.includes("gmail") || user.includes("@gmail.com")) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      });
    }

    return nodemailer.createTransport({
      host: host || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
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
    const recipientEmail = order.customerEmail?.trim();
    if (!recipientEmail || recipientEmail.includes("@guest.shop.co")) {
      console.log(`[Email Service] Skipping email for guest placeholder or empty email: ${recipientEmail}`);
      return { success: false, reason: "Invalid or guest placeholder email" };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://e-commerce-hassam-dev.vercel.app";
    const smtpUser = process.env.SMTP_USER?.trim();
    
    // Ensure fromAddress is valid and compliant with Gmail SMTP rules
    const fromAddress = process.env.EMAIL_FROM?.trim() || (smtpUser ? `"SHOP.CO" <${smtpUser}>` : '"SHOP.CO" <orders@shop.co>');

    // Determine subject & header badge based on status or type
    const status = (newStatus || order.orderStatus || "PROCESSING").toUpperCase();
    let subject = `Order Confirmation #${order.orderNumber} - SHOP.CO`;
    let statusTitle = "Order Confirmed & Processing";
    let statusMessage = "Thank you for your order! We have received your purchase and our fulfillment team is preparing your package.";
    let statusColor = "#10B981"; // Emerald

    if (type === "STATUS_UPDATE") {
      if (status === "SHIPPED") {
        subject = `Order Status Update: Shipped! 📦 #${order.orderNumber} - SHOP.CO`;
        statusTitle = "Your Package Has Shipped!";
        statusMessage = "Great news! Your package has been dispatched from our warehouse and is traveling to your delivery address.";
        statusColor = "#3B82F6"; // Blue
      } else if (status === "DELIVERED" || status === "COMPLETED") {
        subject = `Order Status Update: Delivered! 🎉 #${order.orderNumber} - SHOP.CO`;
        statusTitle = "Package Delivered Successfully!";
        statusMessage = "Your order has been delivered! We hope you love your new apparel. Feel free to leave a product review.";
        statusColor = "#059669"; // Emerald
      } else if (status === "PROCESSING" || status === "PROCESSED") {
        subject = `Order Status Update: Processing #${order.orderNumber} - SHOP.CO`;
        statusTitle = "Status Updated: Processing";
        statusMessage = "Your order status has been updated to Processing. Our fulfillment team is actively preparing and packing your items.";
        statusColor = "#2563EB"; // Blue
      } else if (status === "PENDING_PAYMENT" || status === "PENDING") {
        subject = `Order Status Update: Pending #${order.orderNumber} - SHOP.CO`;
        statusTitle = "Status Updated: Pending Payment";
        statusMessage = "Your order status is currently pending payment or verification.";
        statusColor = "#D97706"; // Amber
      } else if (status === "CANCELLED" || status === "CANCELED") {
        subject = `Order #${order.orderNumber} Cancellation Notice - SHOP.CO`;
        statusTitle = "Order Cancelled";
        statusMessage = "Your order has been cancelled and any reserved items have been returned to stock. If you need assistance, please contact our support.";
        statusColor = "#EF4444"; // Red
      } else if (status === "RETURNED_REFUSED" || status === "RETURNED") {
        subject = `Order #${order.orderNumber} Return Status Update - SHOP.CO`;
        statusTitle = "Order Return Processed";
        statusMessage = "Your return request has been processed and logged in our system.";
        statusColor = "#B45309"; // Amber
      }
    } else {
      if (status === "SHIPPED") {
        subject = `Your Order #${order.orderNumber} Has Shipped! 📦 - SHOP.CO`;
        statusTitle = "Your Package is on the Way!";
        statusMessage = "Great news! Your package has been dispatched from our warehouse and is traveling to your delivery address.";
        statusColor = "#3B82F6"; // Blue
      } else if (status === "DELIVERED") {
        subject = `Delivered: Your Order #${order.orderNumber} Has Arrived! 🎉 - SHOP.CO`;
        statusTitle = "Package Delivered Successfully!";
        statusMessage = "Your order has been delivered! We hope you love your new apparel.";
        statusColor = "#059669"; // Green
      } else if (status === "CANCELLED") {
        subject = `Order #${order.orderNumber} Cancellation Notice - SHOP.CO`;
        statusTitle = "Order Cancelled";
        statusMessage = "Your order has been cancelled.";
        statusColor = "#EF4444"; // Red
      }
    }

    const itemsHtml = order.items
      .map((item) => {
        const variantText = [item.size, item.color].filter(Boolean).join(" / ");
        const priceFormatted = Number(item.unitPrice).toFixed(2);
        const lineTotalFormatted = Number(item.lineTotal || item.unitPrice * item.quantity).toFixed(2);

        return `
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 14px 0;">
              <p style="margin: 0; font-weight: 700; color: #111827; font-size: 14px;">${item.name}</p>
              ${variantText ? `<p style="margin: 3px 0 0 0; color: #6B7280; font-size: 12px;">Variant: ${variantText}</p>` : ""}
            </td>
            <td style="padding: 14px 8px; text-align: center; color: #4B5563; font-size: 13px; font-weight: 600;">x${item.quantity}</td>
            <td style="padding: 14px 0; text-align: right; color: #111827; font-size: 14px; font-weight: 700;">$${lineTotalFormatted}</td>
          </tr>
        `;
      })
      .join("");

    const discountRow = order.discount && order.discount > 0 ? `
      <tr>
        <td style="padding: 6px 0; color: #059669; font-size: 13px; font-weight: 600;">Discount / Promo Savings</td>
        <td style="padding: 6px 0; text-align: right; color: #059669; font-size: 13px; font-weight: 700;">-$${Number(order.discount).toFixed(2)}</td>
      </tr>
    ` : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; margin: 0; padding: 24px 12px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
          
          <!-- Header Bar -->
          <div style="background-color: #000000; padding: 28px; text-align: center;">
            <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0;">SHOP.CO</h1>
            <p style="color: #9CA3AF; font-size: 12px; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Official Order Receipt</p>
          </div>

          <!-- Status Banner -->
          <div style="padding: 24px 28px; background-color: #FAFAFA; border-bottom: 1px solid #E5E7EB; text-align: center;">
            <span style="display: inline-block; background-color: ${statusColor}15; color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
              ${statusTitle}
            </span>
            <h2 style="margin: 0 0 8px 0; color: #111827; font-size: 20px; font-weight: 800;">Order #${order.orderNumber}</h2>
            <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">${statusMessage}</p>
          </div>

          <!-- Order & Payment Info -->
          <div style="padding: 24px 28px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #6B7280; width: 40%;">Order Date:</td>
                <td style="padding: 4px 0; color: #111827; font-weight: 600;">${order.orderDate || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6B7280;">Payment Method:</td>
                <td style="padding: 4px 0; color: #111827; font-weight: 600;">${order.paymentMethod}</td>
              </tr>
              ${order.transactionId ? `
              <tr>
                <td style="padding: 4px 0; color: #6B7280;">Transaction ID:</td>
                <td style="padding: 4px 0; color: #111827; font-family: monospace; font-size: 12px;">${order.transactionId}</td>
              </tr>` : ""}
            </table>

            <!-- Itemized Table -->
            <div style="margin-top: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; color: #111827; letter-spacing: 0.5px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #111827; text-align: left;">
                    <th style="padding: 8px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Item</th>
                    <th style="padding: 8px 8px; text-align: center; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Qty</th>
                    <th style="padding: 8px 0; text-align: right; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6B7280;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Price Breakdown -->
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #111827; font-size: 13px; font-weight: 600;">$${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td style="padding: 4px 0; color: #6B7280; font-size: 13px;">Delivery Fee</td>
                  <td style="padding: 4px 0; text-align: right; color: #111827; font-size: 13px; font-weight: 600;">${order.deliveryFee === 0 ? "FREE" : `$${Number(order.deliveryFee).toFixed(2)}`}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0 0 0; color: #111827; font-size: 16px; font-weight: 800; border-top: 2px solid #111827;">Total Amount</td>
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
      console.log(`[Email Service] Attempting to deliver email via SMTP to: ${recipientEmail} from: ${fromAddress}`);
      const info = await transporter.sendMail({
        from: fromAddress,
        to: recipientEmail,
        subject,
        html: htmlContent,
      });

      console.log(`[Email Service] ✅ Successfully sent email to ${recipientEmail} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`[Email Service] (Preview Mode - SMTP keys not configured) Order notification generated for: ${recipientEmail}`);
      console.log(`[Email Service] Subject: ${subject}`);
      return { success: true, preview: true, reason: "SMTP credentials not provided in environment variables" };
    }
  } catch (error: any) {
    console.error("[Email Service Error] Failed to send order email:", error);
    return { success: false, error: error?.message || String(error) };
  }
}
