"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Transaction } from "../../_data/paymentData";
import { CheckCircle2, Copy, Download, RefreshCcw } from "lucide-react";

interface ModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionModal({ transaction, onClose }: ModalProps) {
  const [copied, setCopied] = useState(false);
  const [refundSimulated, setRefundSimulated] = useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Transaction Details</DialogTitle>
            <Badge
              variant={
                transaction.status === "Succeeded"
                  ? "success"
                  : transaction.status === "Pending"
                  ? "warning"
                  : "destructive"
              }
            >
              {refundSimulated ? "Refunded" : transaction.status}
            </Badge>
          </div>
          <DialogDescription>
            Payment ID: <span className="font-mono text-black font-semibold">{transaction.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Amount Breakdown Card */}
          <div className="rounded-2xl bg-[#F9FAFB] border border-black/5 p-4 space-y-2">
            <div className="flex justify-between text-xs text-black/60">
              <span>Gross Amount</span>
              <span className="font-semibold text-black">${transaction.amount.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-xs text-black/60">
              <span>Processing Fee</span>
              <span className="text-black">-${transaction.fee.toFixed(2)} USD</span>
            </div>
            <div className="pt-2 border-t border-black/10 flex justify-between text-sm font-bold text-black">
              <span>Net Payout</span>
              <span className="font-integral text-emerald-600">
                ${refundSimulated ? "0.00" : transaction.net.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-black/5 p-3">
              <span className="text-black/50 block mb-1">Customer</span>
              <p className="font-bold text-black">{transaction.customerName}</p>
              <p className="text-black/60 truncate">{transaction.customerEmail}</p>
            </div>

            <div className="rounded-xl border border-black/5 p-3">
              <span className="text-black/50 block mb-1">Method</span>
              <p className="font-bold text-black">
                {transaction.paymentMethod} {transaction.cardLast4 ? `•••• ${transaction.cardLast4}` : ""}
              </p>
              <p className="text-black/60">{transaction.channel}</p>
            </div>
          </div>

          {/* Timestamp details */}
          <div className="rounded-xl border border-black/5 p-3 text-xs space-y-1">
            <div className="flex justify-between text-black/60">
              <span>Order Reference:</span>
              <span className="font-mono font-semibold text-black">{transaction.orderId}</span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Authorized Date & Time:</span>
              <span className="text-black">{transaction.date} at {transaction.time}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy ID"}</span>
          </Button>

          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            <span>Receipt</span>
          </Button>

          {transaction.status === "Succeeded" && !refundSimulated && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setRefundSimulated(true)}
              className="gap-1.5 text-xs"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              <span>Issue Refund</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
