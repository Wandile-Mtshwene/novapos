"use client";

import { useState } from "react";
import { Search, Plus, Package, AlertTriangle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ProductDialog } from "./product-dialog";
import type { ProductWithCategory } from "@/lib/db/queries/products";
import type { ProductCategory } from "@/lib/db/schema";

interface ProductsViewProps {
  products: ProductWithCategory[];
  categories: ProductCategory[];
}

export function ProductsView({ products, categories }: ProductsViewProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    if (!search) return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const lowStockItems = filtered.filter(
    (p) => p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 md:px-6 md:py-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <ProductDialog categories={categories}>
          <Button
            size="sm"
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
          >
            <Plus size={14} />
            Add Product
          </Button>
        </ProductDialog>
      </div>

      {lowStockItems.length > 0 && (
        <div className="mx-4 md:mx-6 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm w-auto">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{lowStockItems.length} product{lowStockItems.length > 1 ? "s are" : " is"} running low on stock.</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Add retail products to sell at checkout alongside your services."
            action={{ label: "Add First Product" }}
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto mx-6">
            <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const isLow = p.stock_quantity <= (p.low_stock_threshold ?? 5);
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-[var(--nova-muted)]">{p.sku ?? "N/A"}</TableCell>
                        <TableCell>{p.category?.name ?? "Uncategorized"}</TableCell>
                        <TableCell>{formatCurrency(Number(p.cost_price))}</TableCell>
                        <TableCell>{formatCurrency(Number(p.selling_price))}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {isLow && <AlertTriangle size={12} className="text-amber-400" />}
                            <span className={isLow ? "text-amber-400" : undefined}>
                              {p.stock_quantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.is_active ? "success" : "muted"}>
                            {p.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ProductDialog product={p} categories={categories}>
                            <Button variant="ghost" size="sm" className="text-[var(--nova-muted)] hover:text-[var(--nova-text)]">
                              Edit
                            </Button>
                          </ProductDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="md:hidden space-y-3 px-4 pb-4">
            {filtered.map((p) => {
              const isLow = p.stock_quantity <= (p.low_stock_threshold ?? 5);
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[var(--nova-text)] truncate">{p.name}</span>
                        {p.category && (
                          <Badge variant="muted" className="text-xs shrink-0">
                            {p.category.name}
                          </Badge>
                        )}
                      </div>
                      {p.sku && (
                        <p className="text-xs text-[var(--nova-muted)] font-mono mt-0.5">{p.sku}</p>
                      )}
                    </div>
                    <ProductDialog product={p} categories={categories}>
                      <Button variant="ghost" size="icon-sm" className="text-[var(--nova-muted)] hover:text-[var(--nova-text)] shrink-0">
                        <Pencil size={14} />
                      </Button>
                    </ProductDialog>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-lg font-semibold text-[var(--nova-accent)]">
                      {formatCurrency(Number(p.selling_price))}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isLow
                          ? "bg-red-500/15 text-red-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {isLow && <AlertTriangle size={10} />}
                      {p.stock_quantity} in stock
                    </span>
                    <Badge variant={p.is_active ? "success" : "muted"} className="text-xs">
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
