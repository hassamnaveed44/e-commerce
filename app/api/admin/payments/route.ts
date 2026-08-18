import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

// Global in-memory admin exchange rate & alert settings
let currentUsdToPkrRate = 278.50;
let currentUsdToEurRate = 0.922;
let currentUsdToGbpRate = 0.778;
let activeAlerts: { id: string; source: string; target: string; targetRate: number; createdAt: string }[] = [];

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customRateParam = searchParams.get("rate");
    const rateToUse = customRateParam ? parseFloat(customRateParam) : currentUsdToPkrRate;

    // Fetch all real orders from database with user and payment details
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

    // Calculate real revenue strictly from database orders
    let totalRevenue = 0;
    let completedRevenue = 0;
    let pendingRevenue = 0;

    orders.forEach((o) => {
      const amt = Number(o.totalAmount);
      if (o.orderStatus !== "CANCELLED" && o.orderStatus !== "RETURNED_REFUSED") {
        totalRevenue += amt;
        if (o.orderStatus === "DELIVERED" || o.payment?.status === "SUCCESSFUL" || o.orderStatus === "PROCESSING") {
          completedRevenue += amt;
        } else {
          pendingRevenue += amt;
        }
      }
    });

    // Dynamic funds strictly from database
    const baseUSD = completedRevenue > 0 ? completedRevenue : (totalRevenue > 0 ? totalRevenue : 0);
    const basePKR = Math.round(baseUSD * rateToUse);
    const baseEUR = Math.round(baseUSD * currentUsdToEurRate * 100) / 100;
    const baseGBP = Math.round(baseUSD * currentUsdToGbpRate * 100) / 100;

    const balances = [
      {
        code: "US",
        currency: "USD",
        label: "US",
        amount: baseUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        raw: baseUSD,
      },
      {
        code: "PK",
        currency: "PKR",
        label: "PK",
        amount: basePKR.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        raw: basePKR,
      },
      {
        code: "GB",
        currency: "GBP",
        label: "GB",
        amount: "0.00",
        raw: 0.00,
      },
    ];

    // Real dynamic transactions from database orders
    const allFormattedOrders = orders.map((ord) => {
      const isCompleted = ord.orderStatus === "DELIVERED" || ord.payment?.status === "SUCCESSFUL" || ord.orderStatus === "PROCESSING";
      const customerName = ord.user?.fullName || ord.user?.email?.split("@")[0] || "Customer";
      const amountNum = Number(ord.totalAmount);

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        date: new Date(ord.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        title: `Payment from ${customerName} (Order #${ord.orderNumber})`,
        customerName,
        customerEmail: ord.user?.email || "customer@example.com",
        paymentMethod: ord.paymentMethod === "CARD" ? "Credit / Debit Card (Stripe)" : "Cash on Delivery (COD)",
        orderStatus: ord.orderStatus,
        status: isCompleted ? "Completed" : ord.orderStatus === "SHIPPED" ? "Shipped (In Transit)" : "Pending Payment",
        amount: `+${amountNum.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
        amountPKR: `₨ ${(amountNum * rateToUse).toLocaleString("en-US", { minimumFractionDigits: 2 })} PKR`,
        isPositive: ord.orderStatus !== "CANCELLED",
        type: "deposit",
      };
    });

    // Split orders into Latest (Completed / Processing) and Upcoming (Pending / Shipped)
    const latestTransactions = allFormattedOrders.filter(
      (t) => t.status === "Completed" || t.orderStatus === "DELIVERED" || t.orderStatus === "PROCESSING"
    );

    const upcomingTransactions = allFormattedOrders.filter(
      (t) => t.status !== "Completed" && t.orderStatus !== "CANCELLED"
    );

    // Dynamic timeframe chart calculated around active admin rate
    const chartTimeframes = {
      "1D": [
        { label: "00:00", date: "Today 00:00", value: Number((rateToUse - 0.3).toFixed(2)), x: 10, y: 135 },
        { label: "06:00", date: "Today 06:00", value: Number((rateToUse - 0.05).toFixed(2)), x: 75, y: 130 },
        { label: "12:00", date: "Today 12:00", value: Number((rateToUse + 0.6).toFixed(2)), x: 140, y: 25 },
        { label: "18:00", date: "Today 18:00", value: Number((rateToUse - 0.15).toFixed(2)), x: 200, y: 145 },
        { label: "24:00", date: "Today 24:00", value: Number((rateToUse + 0.4).toFixed(2)), x: 270, y: 20 },
      ],
      "7D": [
        { label: "Jun 24", date: "Jun 24, 2024", value: Number((rateToUse - 0.4).toFixed(2)), x: 10, y: 135 },
        { label: "Jun 26", date: "Jun 26, 2024", value: Number(rateToUse.toFixed(2)), x: 75, y: 130 },
        { label: "Jun 27", date: "Jun 27, 2024", value: Number((rateToUse + 0.7).toFixed(2)), x: 140, y: 25 },
        { label: "Jun 28", date: "Jun 28, 2024", value: Number((rateToUse - 0.2).toFixed(2)), x: 200, y: 145 },
        { label: "Jun 30", date: "Jun 30, 2024", value: Number((rateToUse + 0.9).toFixed(2)), x: 270, y: 20 },
      ],
      "30D": [
        { label: "1 Jun", date: "1 Jun, 2024", value: Number((rateToUse - 0.7).toFixed(2)), x: 10, y: 140 },
        { label: "8 Jun", date: "8 Jun, 2024", value: Number((rateToUse - 0.1).toFixed(2)), x: 75, y: 125 },
        { label: "15 Jun", date: "15 Jun, 2024", value: Number((rateToUse + 1.0).toFixed(2)), x: 140, y: 20 },
        { label: "22 Jun", date: "22 Jun, 2024", value: Number((rateToUse - 0.4).toFixed(2)), x: 200, y: 150 },
        { label: "30 Jun", date: "30 Jun, 2024", value: Number((rateToUse + 0.45).toFixed(2)), x: 270, y: 25 },
      ],
      "90D": [
        { label: "Apr", date: "Apr 2024", value: Number((rateToUse - 1.0).toFixed(2)), x: 10, y: 145 },
        { label: "May", date: "May 2024", value: Number((rateToUse + 0.1).toFixed(2)), x: 75, y: 120 },
        { label: "May 20", date: "May 20, 2024", value: Number((rateToUse + 1.6).toFixed(2)), x: 140, y: 15 },
        { label: "Jun", date: "Jun 2024", value: Number((rateToUse - 0.3).toFixed(2)), x: 200, y: 140 },
        { label: "Jul", date: "Jul 2024", value: Number((rateToUse + 0.5).toFixed(2)), x: 270, y: 30 },
      ],
      "1Y": [
        { label: "Q1", date: "Q1 2024", value: Number((rateToUse - 3.0).toFixed(2)), x: 10, y: 155 },
        { label: "Q2", date: "Q2 2024", value: Number((rateToUse - 0.1).toFixed(2)), x: 75, y: 125 },
        { label: "Q2 Late", date: "Mid 2024", value: Number((rateToUse + 2.5).toFixed(2)), x: 140, y: 20 },
        { label: "Q3", date: "Q3 2024", value: Number((rateToUse + 0.3).toFixed(2)), x: 200, y: 120 },
        { label: "Q4", date: "Q4 2024", value: Number((rateToUse + 4.0).toFixed(2)), x: 270, y: 10 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: {
        totalFundsFormatted: `${baseUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
        baseUSD,
        basePKR,
        currentUsdToPkrRate: rateToUse,
        currentUsdToEurRate,
        currentUsdToGbpRate,
        balances,
        latestTransactions: latestTransactions.length > 0 ? latestTransactions : allFormattedOrders,
        upcomingTransactions,
        chartTimeframes,
        activeAlerts,
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch payment dashboard data" }, { status: 500 });
  }
}

// POST: Admin update custom exchange rate or add rate alert
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (!authResult.authorized) {
      return authResult.errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, rate, targetRate, source, target } = body;

    if (action === "update_rate" && rate) {
      const parsedRate = parseFloat(rate);
      if (!isNaN(parsedRate) && parsedRate > 0) {
        currentUsdToPkrRate = parsedRate;
        return NextResponse.json({
          success: true,
          message: `Exchange rate updated to 1 USD = ${parsedRate} PKR`,
          currentUsdToPkrRate,
        });
      }
    }

    if (action === "set_alert" && targetRate) {
      const newAlert = {
        id: `alt-${Date.now()}`,
        source: source || "US USD",
        target: target || "PK PKR",
        targetRate: parseFloat(targetRate) || currentUsdToPkrRate,
        createdAt: new Date().toISOString(),
      };
      activeAlerts.push(newAlert);
      return NextResponse.json({
        success: true,
        message: `Rate alert saved for ${newAlert.source} at ${newAlert.targetRate} ${newAlert.target}`,
        alert: newAlert,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action or parameters" }, { status: 400 });
  } catch (error) {
    console.error("Update exchange rate error:", error);
    return NextResponse.json({ success: false, error: "Failed to update rate" }, { status: 500 });
  }
}
