"use client";

import { useState } from "react";
import { Search, Plus, Users2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { CustomerDialog } from "./customer-dialog";
import type { Customer } from "@/lib/db/schema";

interface CustomersViewProps {
  customers: Customer[];
}

export function CustomersView({ customers }: CustomersViewProps) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const full = `${c.first_name} ${c.last_name ?? ""} ${c.email ?? ""} ${c.phone ?? ""}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  return (
    <div className="px-4 py-4 md:px-6 md:py-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <CustomerDialog>
          <Button
            size="sm"
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
          >
            <Plus size={14} />
            Add Customer
          </Button>
        </CustomerDialog>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No customers yet"
          description="Your customer profiles will appear here. Add your first customer to get started."
          action={{ label: "Add First Customer" }}
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden pb-4">
            {filtered.map((c) => {
              const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ");
              return (
                <div key={c.id} className="rounded-xl bg-[var(--nova-card)] border border-[var(--nova-border)] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 shrink-0" size="sm">
                          <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
                            {getInitials(fullName, c.email?.[0])}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm text-[var(--nova-text)] truncate">{fullName}</p>
                      </div>
                      <p className="text-xs text-[var(--nova-muted)] mt-0.5 truncate">
                        {c.email ?? c.phone ?? "No contact info"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--nova-tint-1)] text-[var(--nova-muted)]">
                        {c.total_visits} visits
                      </span>
                      <CustomerDialog customer={c}>
                        <button className="p-1.5 rounded-lg hover:bg-[var(--nova-tint-1)] text-[var(--nova-muted)]">
                          <Pencil size={14} />
                        </button>
                      </CustomerDialog>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-[var(--nova-muted)]">
                      Spent: <span className="text-[var(--nova-text)]">{formatCurrency(Number(c.total_spent))}</span>
                    </span>
                    <span className="text-xs text-[var(--nova-muted)]">
                      Since {formatDate(c.created_at.toISOString())}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block rounded-xl border border-[var(--nova-border)] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ");
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 shrink-0" size="sm">
                            <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
                              {getInitials(fullName, c.email?.[0])}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{c.phone ?? "N/A"}</TableCell>
                      <TableCell>{c.email ?? "N/A"}</TableCell>
                      <TableCell>{c.total_visits}</TableCell>
                      <TableCell>{formatCurrency(Number(c.total_spent))}</TableCell>
                      <TableCell>{formatDate(c.created_at.toISOString())}</TableCell>
                      <TableCell>
                        <CustomerDialog customer={c}>
                          <Button variant="ghost" size="sm" className="text-[var(--nova-muted)] hover:text-[var(--nova-text)]">
                            Edit
                          </Button>
                        </CustomerDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
