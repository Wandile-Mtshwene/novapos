"use client";

import { useState } from "react";
import { Search, Plus, Users2 } from "lucide-react";
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
    <div className="p-6 space-y-5">
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
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
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
      )}
    </div>
  );
}
