"use client";

import { useState } from "react";
import { formatHolidayMoney, holidayBonusForTotal } from "@/lib/holiday-gift-campaign";

export function HolidayGiftOrderForm() {
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const dollars = /^\d+(?:\.\d{1,2})?$/.test(amount) ? Number(amount) : 0;
  const totalCents = Math.round(dollars * 100) * Number(quantity);
  const valid = Number.isSafeInteger(totalCents) && totalCents >= 50 && totalCents <= 99999999 && /^\d+$/.test(quantity) && Number(quantity) >= 1 && Number(quantity) <= 100;
  const bonus = valid ? holidayBonusForTotal(totalCents) : 0;
  return (
    <form action="/api/checkout" method="post" className="mt-6 space-y-4 rounded-[22px] border border-[var(--color-button-line)] p-5" aria-describedby="holiday-gift-terms">
      <h3 className="display-card-title">Choose a custom amount or several certificates</h3>
      <input type="hidden" name="slug" value="gift-certificate" />
      <input type="hidden" name="optionKey" value="gift-custom" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 font-semibold">Value of each certificate ($)
          <input name="customAmount" inputMode="decimal" type="number" min="0.01" step="0.01" max="999999.99" required value={amount} onChange={(event) => setAmount(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-button-line)] bg-white px-3 text-[var(--color-text)]" />
        </label>
        <label className="grid gap-2 font-semibold">Number of certificates
          <input name="quantity" inputMode="numeric" type="number" min="1" max="100" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} className="min-h-11 rounded-xl border border-[var(--color-button-line)] bg-white px-3 text-[var(--color-text)]" />
        </label>
      </div>
      <p className="text-sm text-[var(--color-brown)]">Each paid certificate has its own code and full purchased value. One complimentary voucher is issued for the transaction total. Up to 100 certificates per online order. Online payments start at $0.50 per order.</p>
      <p aria-live="polite" className="font-semibold text-[var(--color-brown)]">{valid ? `Total: ${formatHolidayMoney(totalCents)}. ${bonus ? `Plus a separate ${formatHolidayMoney(bonus)} complimentary promotional voucher.` : "Promotional vouchers begin with a $50 transaction total."}` : "Enter a certificate value and quantity to see your total and bonus."}</p>
      <button type="submit" className="button-pill" disabled={!valid}>Continue to Secure Payment</button>
    </form>
  );
}
