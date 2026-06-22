"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustStockAction } from "@/lib/products/actions";
import type { ProductWithCategory } from "@/lib/db/queries/products";
import type { StockMovement } from "@/lib/db/schema";

interface StockAdjustDialogProps {
  product: ProductWithCategory;
  children: React.ReactNode;
}

const ADJUST_TYPES: { value: StockMovement["type"]; label: string }[] = [
  { value: "purchase", label: "Purchase (add stock)" },
  { value: "adjustment", label: "Manual Adjustment" },
  { value: "return", label: "Customer Return" },
];

export function StockAdjustDialog({ product, children }: StockAdjustDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    type: "adjustment" as StockMovement["type"],
    direction: "add" as "add" | "remove",
    quantity: "1",
    note: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseInt(form.quantity);
    if (isNaN(qty) || qty <= 0) return;

    const delta = form.direction === "add" ? qty : -qty;

    startTransition(async () => {
      await adjustStockAction(product.id, delta, form.type, form.note || undefined);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </span>
      <DialogContent className="max-w-sm">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 rounded-xl bg-[var(--nova-tint-2)] border border-[var(--nova-border)]">
          <p className="text-sm font-medium text-[var(--nova-text)]">{product.name}</p>
          <p className="text-xs text-[var(--nova-muted)] mt-0.5">
            Current stock: <span className="text-[var(--nova-text)] font-semibold">{product.stock_quantity}</span> units
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Action
            </label>
            <div className="flex gap-2">
              {(["add", "remove"] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => set("direction", dir)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-colors ${
                    form.direction === dir
                      ? dir === "add"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : "bg-red-500/20 border-red-500 text-red-400"
                      : "border-[var(--nova-border)] text-[var(--nova-muted)] hover:bg-[var(--nova-tint-3)]"
                  }`}
                >
                  {dir === "add" ? "+ Add" : "- Remove"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Reason
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className="w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)] px-3 py-2 text-sm text-[var(--nova-text)] focus:outline-none focus:border-[var(--nova-accent)] transition-colors"
            >
              {ADJUST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Note (optional)
            </label>
            <Input
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Reason for adjustment"
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? <Loader2 size={14} className="animate-spin" /> : "Adjust Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
