"use client";

import { useState } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface PaymentFormProps {
  onSubmit?: (data: PaymentFormData) => void;
  onCancel?: () => void;
}

export interface PaymentFormData {
  type: "CARD" | "BANK_TRANSFER";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
}

export function PaymentForm({ onSubmit, onCancel }: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<"CARD" | "BANK_TRANSFER">("CARD");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: PaymentFormData = {
      type: paymentType,
      cardholderName: formData.get("cardholderName") as string,
      cardNumber: formData.get("cardNumber") as string,
      expiryDate: formData.get("expiryDate") as string,
      cvv: formData.get("cvv") as string,
      bankName: formData.get("bankName") as string,
      accountNumber: formData.get("accountNumber") as string,
      routingNumber: formData.get("routingNumber") as string,
    };
    onSubmit?.(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
        <CardDescription>
          Add a card or bank account for billing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setPaymentType("CARD")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
              paymentType === "CARD"
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400"
            )}
          >
            <CreditCard className="h-4 w-4" />
            Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentType("BANK_TRANSFER")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
              paymentType === "BANK_TRANSFER"
                ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400"
            )}
          >
            <Banknote className="h-4 w-4" />
            Bank Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {paymentType === "CARD" ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cardholder Name</label>
                <Input name="cardholderName" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <Input
                  name="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <Input name="expiryDate" placeholder="MM/YY" maxLength={5} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVV</label>
                  <Input name="cvv" placeholder="123" maxLength={4} required />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Name</label>
                <Input name="bankName" placeholder="Chase Bank" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <Input name="accountNumber" placeholder="000123456789" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Routing Number</label>
                <Input name="routingNumber" placeholder="021000021" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Holder Name</label>
                <Input name="cardholderName" placeholder="John Doe" required />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">Save Payment Method</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
