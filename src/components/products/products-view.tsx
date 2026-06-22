"use client";

import { useState } from "react";
import { Search, Plus, Package, AlertTriangle } from "lucide-react";
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

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
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

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add retail products to sell at checkout alongside your services."
          action={{ label: "Add First Product" }}
        />
      ) : (
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
      )}
    </div>
  );
}
