"use client";

import { useState } from "react";
import { Search, Plus, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

interface Appointment {
  id: string;
  customerName: string;
  serviceName: string;
  staffName: string;
  startsAt: string;
  duration: number;
  price: string;
  status: AppointmentStatus;
}

const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; variant: "success" | "warning" | "danger" | "muted" | "default" }
> = {
  scheduled: { label: "Scheduled", variant: "muted" },
  confirmed: { label: "Confirmed", variant: "default" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  no_show: { label: "No Show", variant: "danger" },
};

const FILTERS: { label: string; value: AppointmentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export function AppointmentsView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all");
  const appointments: Appointment[] = [];

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      !search ||
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--nova-border)] text-[var(--nova-muted)] hover:text-[var(--nova-text)] gap-1.5"
          >
            <Filter size={13} />
            Filter
          </Button>
          <Button
            size="sm"
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
          >
            <Plus size={14} />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === value
                ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-2)] hover:text-[var(--nova-text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table or empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No appointments yet"
          description="Appointments will appear here once you start booking services for customers."
          action={{ label: "Book First Appointment" }}
        />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const { label, variant } = STATUS_CONFIG[a.status];
                return (
                  <TableRow key={a.id} className="cursor-pointer">
                    <TableCell className="font-medium">{a.customerName}</TableCell>
                    <TableCell>{a.serviceName}</TableCell>
                    <TableCell>{a.staffName}</TableCell>
                    <TableCell>{a.startsAt}</TableCell>
                    <TableCell>{a.duration} min</TableCell>
                    <TableCell>{a.price}</TableCell>
                    <TableCell>
                      <Badge variant={variant}>{label}</Badge>
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
