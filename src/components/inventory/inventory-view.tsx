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
    <div className="p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Warehouse}
            title="No inventory yet"
            description="Add products in the Products section to start tracking inventory."
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
