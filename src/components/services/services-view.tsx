"use client";

import { useState } from "react";
import { Search, Plus, Scissors, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ServiceDialog } from "./service-dialog";
import { formatCurrency } from "@/lib/utils";
import type { ServiceWithCategory } from "@/lib/db/queries/services";
import type { ServiceCategory } from "@/lib/db/schema";

interface ServicesViewProps {
  services: ServiceWithCategory[];
  categories: ServiceCategory[];
}

export function ServicesView({ services, categories }: ServicesViewProps) {
  const [search, setSearch] = useState("");

  const filtered = services.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <ServiceDialog categories={categories}>
          <Button
            size="sm"
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
          >
            <Plus size={14} />
            Add Service
          </Button>
        </ServiceDialog>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services yet"
          description="Add your first service to start booking appointments."
          action={{ label: "Add First Service" }}
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden pb-4">
            {filtered.map((s) => (
              <div key={s.id} className="rounded-xl bg-[var(--nova-card)] border border-[var(--nova-border)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: s.color ?? "#8B5CF6" }}
                      />
                      <p className="font-medium text-sm text-[var(--nova-text)] truncate">{s.name}</p>
                    </div>
                    <p className="text-xs text-[var(--nova-muted)] mt-0.5 truncate">
                      {s.category?.name ?? "Uncategorized"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={s.is_active ? "success" : "muted"}>
                      {s.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <ServiceDialog service={s} categories={categories}>
                      <button className="p-1.5 rounded-lg hover:bg-[var(--nova-tint-1)] text-[var(--nova-muted)]">
                        <Pencil size={14} />
                      </button>
                    </ServiceDialog>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-[var(--nova-muted)]">{s.duration_minutes} min</span>
                  <span className="text-xs font-medium text-[var(--nova-text)]">{formatCurrency(Number(s.price))}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block rounded-xl border border-[var(--nova-border)] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.color ?? "#8B5CF6" }}
                        />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{s.category?.name ?? "Uncategorized"}</TableCell>
                    <TableCell>{s.duration_minutes} min</TableCell>
                    <TableCell>{formatCurrency(Number(s.price))}</TableCell>
                    <TableCell>
                      <Badge variant={s.is_active ? "success" : "muted"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ServiceDialog service={s} categories={categories}>
                        <Button variant="ghost" size="sm" className="text-[var(--nova-muted)] hover:text-[var(--nova-text)]">
                          Edit
                        </Button>
                      </ServiceDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
