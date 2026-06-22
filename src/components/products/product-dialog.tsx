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
import { cn } from "@/lib/utils";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/lib/products/actions";
import type { ProductWithCategory } from "@/lib/db/queries/products";
import type { ProductCategory } from "@/lib/db/schema";

interface ProductDialogProps {
  product?: ProductWithCategory;
  categories: ProductCategory[];
  children: React.ReactNode;
}

export function ProductDialog({ product, categories, children }: ProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isEditing = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    category_id: product?.category_id ?? "",
    cost_price: product?.cost_price ?? "0",
    selling_price: product?.selling_price ?? "0",
    stock_quantity: product?.stock_quantity?.toString() ?? "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() ?? "5",
    is_active: product?.is_active ?? true,
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isEditing) {
        await updateProductAction(product.id, {
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          category_id: form.category_id || undefined,
          cost_price: form.cost_price,
          selling_price: form.selling_price,
          low_stock_threshold: parseInt(form.low_stock_threshold),
          is_active: form.is_active as boolean,
        });
      } else {
        await createProductAction({
          name: form.name,
          description: form.description || undefined,
          sku: form.sku || undefined,
          category_id: form.category_id || undefined,
          cost_price: form.cost_price,
          selling_price: form.selling_price,
          stock_quantity: parseInt(form.stock_quantity),
          low_stock_threshold: parseInt(form.low_stock_threshold),
        });
      }
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteProductAction(product!.id);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </span>
      <DialogContent className="max-w-md">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "New Product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Shampoo 250ml"
              required
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                SKU
              </label>
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="SKU-001"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Category
              </label>
              <select
                value={form.category_id}
                onChange={(e) => set("category_id", e.target.value)}
                className={cn(
                  "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                  "px-3 py-2 text-sm text-[var(--nova-text)]",
                  "focus:outline-none focus:border-[var(--nova-accent)] transition-colors"
                )}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Cost Price (R)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Selling Price (R)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.selling_price}
                onChange={(e) => set("selling_price", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Initial Stock
              </label>
              <Input
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={(e) => set("stock_quantity", e.target.value)}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Low Stock Alert Threshold
            </label>
            <Input
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={(e) => set("low_stock_threshold", e.target.value)}
              className="w-full"
            />
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active as boolean}
                onChange={(e) => set("is_active", e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-[var(--nova-text)]">Active</span>
            </label>
          )}

          <DialogFooter>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
