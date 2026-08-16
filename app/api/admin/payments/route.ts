import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

// Dynamic exchange rates relative to USD
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  PKR: 279.0,
};

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get("type") || "all"; // all, Completed, Pending
    const search = searchParams.get("search")?.toLowerCase().trim();

    // Fetch all orders with user and payment info
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        payment: true,
      },
    });

    // Calculate real dynamic totals
    let totalRevenueUSD = 0;
    let pendingSettlementUSD = 0;
    let successfulRevenueUSD = 0;

    const rawTransactions = orders.map((order) => {
      const amount = Number(order.totalAmount);
      const isCancelled = order.orderStatus === "CANCELLED" || order.orderStatus === "RETURNED_REFUSED";
      const isDelivered = order.orderStatus === "DELIVERED";
      const isPaymentSuccess = order.payment?.status === "SUCCESSFUL" || isDelivered;
      const isRefunded = order.payment?.status === "REFUNDED";

      if (!isCancelled && !isRefunded) {
        totalRevenueUSD += amount;
        if (isPaymentSuccess) {
          successfulRevenueUSD += amount;
        } else {
          pendingSettlementUSD += amount;
        }
      }

      const customerName = order.user?.fullName || order.user?.email.split("@")[0] || "Customer";
      const channel = order.paymentMethod === "CARD" ? "Stripe Card Payment" : "Cash on Delivery (COD)";

      let status = "Pending";
      if (isCancelled) status = "Cancelled";
      else if (isRefunded) status = "Refunded";
      else if (isPaymentSuccess) status = "Completed";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentId: order.payment?.id || null,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        timestamp: order.createdAt.toISOString(),
        title: `Order ${order.orderNumber} - ${customerName}`,
        channel,
        customerName,
        customerEmail: order.user?.email || "",
        paymentMethod: order.paymentMethod,
        orderStatus: order.orderStatus,
        status,
        amountNumber: amount,
        amount: `+${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
        type: "deposit",
        positive: status === "Completed",
      };
    });

    // Filter transactions
    let filteredTransactions = rawTransactions;
    if (filterType !== "all") {
      filteredTransactions = filteredTransactions.filter((t) => t.status === filterType);
    }
    if (search) {
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.orderNumber.toLowerCase().includes(search) ||
          t.customerName.toLowerCase().includes(search) ||
          t.customerEmail.toLowerCase().includes(search) ||
          t.channel.toLowerCase().includes(search)
      );
    }

    // Dynamic Multi-Currency Available Balances (ONLY COMPLETED/SUCCESSFUL FUNDS)
    const availableUSD = successfulRevenueUSD;
    const availablePKR = availableUSD * EXCHANGE_RATES.PKR;

    const balances = [
      {
        currency: "USD",
        label: "us USD",
        flag: "🇺🇸",
        amount: availableUSD.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        symbol: "$",
        raw: availableUSD,
      },
      {
        currency: "PKR",
        label: "pk PKR",
        flag: "🇵🇰",
        amount: availablePKR.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        symbol: "₨",
        raw: availablePKR,
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        overview: {
          totalRevenueUSD: availableUSD, // Available Completed Revenue
          totalRevenuePKR: availablePKR,
          successfulRevenueUSD,
          pendingSettlementUSD,
          totalTransactions: orders.length,
        },
        balances,
        exchangeRates: [
          { pair: "USD / PKR", rate: EXCHANGE_RATES.PKR.toFixed(2), change: "+0.15%", positive: true },
          { pair: "PKR / USD", rate: (1 / EXCHANGE_RATES.PKR).toFixed(6), change: "-0.15%", positive: false },
        ],
        transactions: filteredTransactions,
      },
    });
  } catch (error) {
    console.error("Admin payments API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payment balances" }, { status: 500 });
  }
}

// Inline Status Changer for Transactions & Payments
export async function PATCH(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, newStatus } = body; // newStatus: "Completed" | "Pending" | "Refunded" | "Cancelled"

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let paymentStatusValue: "SUCCESSFUL" | "PENDING" | "REFUNDED" | "FAILED" = "PENDING";
    let orderStatusValue = order.orderStatus;

    if (newStatus === "Completed") {
      paymentStatusValue = "SUCCESSFUL";
      if (order.orderStatus === "PENDING_PAYMENT") {
        orderStatusValue = "PROCESSING";
      }
    } else if (newStatus === "Pending") {
      paymentStatusValue = "PENDING";
    } else if (newStatus === "Refunded") {
      paymentStatusValue = "REFUNDED";
    } else if (newStatus === "Cancelled") {
      paymentStatusValue = "FAILED";
      orderStatusValue = "CANCELLED";
    }

    if (order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: paymentStatusValue,
          ...(newStatus === "Completed" && !order.payment.amountPaid ? { amountPaid: order.totalAmount } : {}),
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: order.paymentMethod,
          status: paymentStatusValue,
          amountPaid: newStatus === "Completed" ? order.totalAmount : 0,
        },
      });
    }

    if (orderStatusValue !== order.orderStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: orderStatusValue },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Updated payment status to ${newStatus} for Order #${order.orderNumber}`,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}
