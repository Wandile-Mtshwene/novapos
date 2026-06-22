"use client";

import { useState } from "react";
import { Search, Plus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { getInitials } from "@/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StaffDialog } from "./staff-dialog";
import type { Staff } from "@/lib/db/schema";

interface StaffViewProps {
  staffMembers: Staff[];
}

export function StaffView({ staffMembers }: StaffViewProps) {
  const [search, setSearch] = useState("");

  const filtered = staffMembers.filter((s) => {
    if (!search) return true;
    const full = `${s.first_name} ${s.last_name ?? ""} ${s.role}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)]" />
          <Input
            placeholder="Search staff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 w-full sm:w-64 bg-[var(--nova-tint-2)] border-[var(--nova-border)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)]"
          />
        </div>
        <StaffDialog>
          <Button
            size="sm"
            className="bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white gap-1.5"
          >
            <Plus size={14} />
            Add Staff Member
          </Button>
        </StaffDialog>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No staff members yet"
          description="Add your team members to assign appointments and track commissions."
          action={{ label: "Add First Staff Member" }}
        />
      ) : (
        <div className="rounded-xl border border-[var(--nova-border)] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const fullName = [s.first_name, s.last_name].filter(Boolean).join(" ");
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 shrink-0" size="sm">
                          <AvatarFallback className="bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] text-xs font-semibold">
                            {getInitials(fullName, s.email?.[0])}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[var(--nova-text)]">{fullName}</p>
                          {s.email && (
                            <p className="text-[11px] text-[var(--nova-muted)]">{s.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{s.role}</TableCell>
                    <TableCell>{s.phone ?? "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(s.specialties ?? []).slice(0, 2).map((sp) => (
                          <Badge key={sp} variant="muted">{sp}</Badge>
                        ))}
                        {(s.specialties ?? []).length > 2 && (
                          <Badge variant="muted">+{(s.specialties ?? []).length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{s.commission_pct}%</TableCell>
                    <TableCell>
                      <Badge variant={s.is_active ? "success" : "muted"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StaffDialog member={s}>
                        <Button variant="ghost" size="sm" className="text-[var(--nova-muted)] hover:text-[var(--nova-text)]">
                          Edit
                        </Button>
                      </StaffDialog>
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
