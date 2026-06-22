"use client";

import { useState, useTransition } from "react";
import {
  Plus, Minus, X, CreditCard, Banknote, Send, Search,
  Scissors, Package, ChevronRight, Users2, Loader2, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { completeSaleAction } from "@/lib/sales/actions";
import type { ServiceWithCategory } from "@/lib/db/queries/services";
import type { ProductWithCategory } from "@/lib/db/queries/products";
import type { Customer, Sale } from "@/lib/db/schema";

type PaymentMethod = Sale["payment_method"];

interface CartItem {
  id: string;
  name: string;
  type: "service" | "product";
  sourceId: string;
  unitPrice: number;
  quantity: number;
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}[] = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "eft", label: "EFT", icon: Send },
];

interface CheckoutViewProps {
  services: ServiceWithCategory[];
  products: ProductWithCategory[];
  customers: Customer[];
  taxRate: number;
  tipEnabled: boolean;
}

export function CheckoutView({
  services,
  products,
  customers,
  taxRate,
  tipEnabled,
}: CheckoutViewProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [tipAmount, setTipAmount] = useState(0);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "products">("services");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [saleComplete, setSaleComplete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const taxRateDecimal = taxRate / 100;
  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const taxAmount = subtotal * taxRateDecimal;
  const grandTotal = subtotal + taxAmount + tipAmount;

  const filteredItems =
    activeTab === "services"
      ? services.filter(
          (s) =>
            s.is_active &&
            (!search || s.name.toLowerCase().includes(search.toLowerCase()))
        )
      : products.filter(
          (p) =>
            p.is_active &&
            (!search || p.name.toLowerCase().includes(search.toLowerCase()))
        );

  function addItem(item: Omit<CartItem, "quantity">) {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }

  function handleCharge() {
    if (cart.length === 0) return;

    startTransition(async () => {
      await completeSaleAction({
        customer_id: selectedCustomerId || undefined,
        items: cart.map((c) => ({
          product_id: c.type === "product" ? c.sourceId : undefined,
          service_id: c.type === "service" ? c.sourceId : undefined,
          name: c.name,
          quantity: c.quantity,
          unit_price: c.unitPrice,
        })),
        discount_amount: 0,
        tip_amount: tipAmount,
        tax_amount: taxAmount,
        subtotal,
        total: grandTotal,
        payment_method: paymentMethod,
      });
      setCart([]);
      setTipAmount(0);
      setSelectedCustomerId("");
      setSaleComplete(true);
      setTimeout(() => setSaleComplete(false), 3000);
    });
  }

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  if (saleComplete) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 mx-auto">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--nova-text)]">Sale Complete</h3>
          <p className="text-sm text-[var(--nova-muted)]">Payment received successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden md:flex-row">
      {/* Left: item selection */}
      <div className="flex flex-col border-b border-[var(--nova-border)] overflow-hidden md:flex-1 md:border-b-0 md:border-r min-h-0 flex-1">
        {/* Search and tabs */}
        <div className="p-4 border-b border-[var(--nova-border)] space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
            <Input
              placeholder="Search services or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
            />
          </div>

          <div className="flex gap-1">
            {(["services", "products"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                    : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-2)] hover:text-[var(--nova-text)]"
                )}
              >
                {tab === "services" ? <Scissors size={13} /> : <Package size={13} />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Customer picker */}
        <div className="px-4 py-3 border-b border-[var(--nova-border)] relative shrink-0">
          <button
            onClick={() => setShowCustomerPicker((v) => !v)}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[var(--nova-border)] p-3 text-sm hover:border-[var(--nova-accent)]/40 hover:text-[var(--nova-accent)] transition-colors"
          >
            <Users2 size={15} className="text-[var(--nova-muted)]" />
            <span className={selectedCustomer ? "text-[var(--nova-text)]" : "text-[var(--nova-muted)]"}>
              {selectedCustomer
                ? `${selectedCustomer.first_name} ${selectedCustomer.last_name ?? ""}`.trim()
                : "Select customer (optional)"}
            </span>
            <ChevronRight size={13} className="ml-auto text-[var(--nova-muted)]" />
          </button>

          {showCustomerPicker && (
            <div className="absolute left-4 right-4 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] shadow-lg">
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-[var(--nova-muted)] hover:bg-[var(--nova-tint-2)]"
                onClick={() => { setSelectedCustomerId(""); setShowCustomerPicker(false); }}
              >
                Walk-in (no customer)
              </button>
              {customers.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full items-center px-3 py-2 text-sm text-[var(--nova-text)] hover:bg-[var(--nova-tint-2)]"
                  onClick={() => { setSelectedCustomerId(c.id); setShowCustomerPicker(false); }}
                >
                  {c.first_name} {c.last_name ?? ""}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              {activeTab === "services" ? (
                <Scissors size={32} className="text-[var(--nova-dim)] mb-3" />
              ) : (
                <Package size={32} className="text-[var(--nova-dim)] mb-3" />
              )}
              <p className="text-sm text-[var(--nova-muted)]">
                No {activeTab} found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
              {activeTab === "services"
                ? (filteredItems as ServiceWithCategory[]).map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        addItem({
                          id: `svc-${s.id}`,
                          sourceId: s.id,
                          name: s.name,
                          type: "service",
                          unitPrice: Number(s.price),
                        })
                      }
                      className="flex flex-col items-start gap-1 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-3 text-left hover:border-[var(--nova-accent)]/40 hover:bg-[var(--nova-tint-2)] transition-all"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: s.color ?? "#8B5CF6" }}
                      />
                      <p className="text-sm font-medium text-[var(--nova-text)] leading-tight">
                        {s.name}
                      </p>
                      <p className="text-xs text-[var(--nova-muted)]">
                        {formatCurrency(Number(s.price))}
                      </p>
                    </button>
                  ))
                : (filteredItems as ProductWithCategory[]).map((p) => (
                    <button
                      key={p.id}
                      onClick={() =>
                        addItem({
                          id: `prd-${p.id}`,
                          sourceId: p.id,
                          name: p.name,
                          type: "product",
                          unitPrice: Number(p.selling_price),
                        })
                      }
                      disabled={p.stock_quantity === 0}
                      className="flex flex-col items-start gap-1 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-3 text-left hover:border-[var(--nova-accent)]/40 hover:bg-[var(--nova-tint-2)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Package size={14} className="text-[var(--nova-muted)]" />
                      <p className="text-sm font-medium text-[var(--nova-text)] leading-tight">
                        {p.name}
                      </p>
                      <p className="text-xs text-[var(--nova-muted)]">
                        {formatCurrency(Number(p.selling_price))}
                      </p>
                      {p.stock_quantity === 0 && (
                        <Badge variant="danger" className="text-[9px] py-0">Out of stock</Badge>
                      )}
                    </button>
                  ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: cart and payment */}
      <div className="flex shrink-0 flex-col bg-[var(--nova-deep)] md:w-80">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--nova-border)] shrink-0">
          <span className="text-sm font-semibold text-[var(--nova-text)]">Cart</span>
          {cart.length > 0 && (
            <Badge variant="muted">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        <div className="overflow-y-auto flex-1 md:flex-initial" style={{ maxHeight: "calc(50vh - 8rem)" }}>
          <div className="md:hidden" style={{ maxHeight: "inherit", overflowY: "auto" }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center px-4">
                <p className="text-sm text-[var(--nova-muted)]">Cart is empty</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--nova-text)] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--nova-muted)] mt-0.5">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-[var(--nova-dim)] hover:text-red-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--nova-tint-3)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-semibold text-[var(--nova-text)] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--nova-tint-3)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[var(--nova-text)]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:block h-full overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--nova-tint-3)] mb-3">
                  <CreditCard size={20} className="text-[var(--nova-dim)]" />
                </div>
                <p className="text-sm text-[var(--nova-muted)]">Cart is empty</p>
                <p className="text-xs text-[var(--nova-dim)] mt-1">
                  Select services or products from the left panel.
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--nova-text)] truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--nova-muted)] mt-0.5">
                          {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-[var(--nova-dim)] hover:text-red-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--nova-tint-3)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-semibold text-[var(--nova-text)] w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="flex h-5 w-5 items-center justify-center rounded-md bg-[var(--nova-tint-3)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-[var(--nova-text)]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--nova-border)] p-4 space-y-4 shrink-0">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[var(--nova-muted)]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--nova-muted)]">
              <span>VAT ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            {tipEnabled && (
              <div className="flex items-center justify-between text-[var(--nova-muted)]">
                <span>Tip</span>
                <div className="flex flex-wrap gap-1">
                  {[0, 10, 15, 20].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTipAmount(pct === 0 ? 0 : subtotal * (pct / 100))}
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-md border transition-colors",
                        tipAmount === (pct === 0 ? 0 : subtotal * (pct / 100))
                          ? "border-[var(--nova-accent)] text-[var(--nova-accent)] bg-[var(--nova-accent-dim)]"
                          : "border-[var(--nova-border)] text-[var(--nova-dim)] hover:border-[var(--nova-border-strong)]"
                      )}
                    >
                      {pct === 0 ? "None" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-between font-semibold text-[var(--nova-text)] pt-1 border-t border-[var(--nova-border)]">
              <span>Total</span>
              <span className="text-[var(--nova-accent)]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-dim)]">
              Payment Method
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-all border",
                    paymentMethod === value
                      ? "border-[var(--nova-accent)] bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                      : "border-[var(--nova-border)] text-[var(--nova-muted)] hover:border-[var(--nova-border-strong)] hover:text-[var(--nova-text)]"
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button
            disabled={cart.length === 0 || isPending}
            onClick={handleCharge}
            className="w-full h-12 text-base bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white font-semibold rounded-xl disabled:opacity-40"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              `Charge ${cart.length > 0 ? formatCurrency(grandTotal) : ""}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
