"use client";

import { useState } from "react";
import { Search, Warehouse, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { StockAdjustDialog } from "./stock-adjust-dialog";
import { formatCurrency } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ProductWithCategory } from "@/lib/db/queries/products";

interface InventoryViewProps {
  products: ProductWithCategory[];
  inventoryValue: number;
}

export function InventoryView({ products, inventoryValue }: InventoryViewProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) => {
    if (!search) return true;
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const lowStockCount = products.filter(
    (p) => p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stock_quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 md:px-6 md:py-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
      </div>

      <div className="px-4 md:px-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Products"
          value={String(products.length)}
          icon={Warehouse}
          iconColor="text-[var(--nova-accent)]"
          iconBg="bg-[var(--nova-accent-dim)]"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={Warehouse}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Low Stock"
          value={String(lowStockCount)}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
        <StatCard
          label="Out of Stock"
          value={String(outOfStockCount)}
          icon={AlertTriangle}
          iconColor="text-red-400"
          iconBg="bg-red-500/10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="px-4 md:px-6">
          <EmptyState
            icon={Warehouse}
            title="No inventory yet"
            description="Add products in the Products section to start tracking inventory."
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto px-6">
            <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Adjust</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => {
                    const isLow = p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0;
                    const isOut = p.stock_quantity === 0;
                    const itemValue = Number(p.cost_price) * p.stock_quantity;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-[var(--nova-muted)]">
                          {p.sku ?? "N/A"}
                        </TableCell>
                        <TableCell>{p.category?.name ?? "Uncategorized"}</TableCell>
                        <TableCell>
                          <span className={isOut ? "text-red-400" : isLow ? "text-amber-400" : undefined}>
                            {p.stock_quantity}
                          </span>
                        </TableCell>
                        <TableCell>{p.low_stock_threshold ?? 5}</TableCell>
                        <TableCell>{formatCurrency(itemValue)}</TableCell>
                        <TableCell>
                          {isOut ? (
                            <Badge variant="danger">Out of Stock</Badge>
                          ) : isLow ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <StockAdjustDialog product={p}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-[var(--nova-muted)] hover:text-[var(--nova-text)]"
                            >
                              <SlidersHorizontal size={13} />
                            </Button>
                          </StockAdjustDialog>
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
              const isLow = p.stock_quantity <= (p.low_stock_threshold ?? 5) && p.stock_quantity > 0;
              const isOut = p.stock_quantity === 0;
              const itemValue = Number(p.cost_price) * p.stock_quantity;
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--nova-text)] truncate">{p.name}</p>
                      <p className="text-xs text-[var(--nova-muted)] mt-0.5">
                        {p.category?.name ?? "Uncategorized"}
                      </p>
                    </div>
                    <StockAdjustDialog product={p}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[var(--nova-muted)] hover:text-[var(--nova-text)] shrink-0 gap-1.5"
                      >
                        <SlidersHorizontal size={12} />
                        Adjust
                      </Button>
                    </StockAdjustDialog>
                  </div>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-2xl font-bold ${
                          isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-[var(--nova-text)]"
                        }`}
                      >
                        {p.stock_quantity}
                      </span>
                      <span className="text-xs text-[var(--nova-muted)]">units</span>
                    </div>
                    <span className="text-sm text-[var(--nova-muted)]">{formatCurrency(itemValue)}</span>
                    {isOut ? (
                      <Badge variant="danger">Out of Stock</Badge>
                    ) : isLow ? (
                      <Badge variant="warning">
                        <AlertTriangle size={10} className="mr-1" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="success">In Stock</Badge>
                    )}
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
