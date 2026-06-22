"use client";

import { useState, useTransition } from "react";
import { Loader2, X } from "lucide-react";
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
import {
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/lib/staff/actions";
import type { Staff } from "@/lib/db/schema";

interface StaffDialogProps {
  member?: Staff;
  children: React.ReactNode;
}

export function StaffDialog({ member, children }: StaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isEditing = !!member;

  const [form, setForm] = useState({
    first_name: member?.first_name ?? "",
    last_name: member?.last_name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    role: member?.role ?? "Staff",
    commission_pct: member?.commission_pct ?? "0",
    specialties: member?.specialties ?? ([] as string[]),
    specialtyInput: "",
    is_active: member?.is_active ?? true,
  });

  function set(field: string, value: string | boolean | string[]) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addSpecialty() {
    const val = form.specialtyInput.trim();
    if (!val || form.specialties.includes(val)) return;
    set("specialties", [...form.specialties, val]);
    set("specialtyInput", "");
  }

  function removeSpecialty(s: string) {
    set("specialties", form.specialties.filter((x) => x !== s));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        first_name: form.first_name,
        last_name: form.last_name || undefined,
        email: form.email || undefined,
        phone: form.phone || undefined,
        role: form.role,
        commission_pct: form.commission_pct,
        specialties: form.specialties,
        is_active: form.is_active as boolean,
      };
      if (isEditing) {
        await updateStaffAction(member.id, data);
      } else {
        await createStaffAction(data);
      }
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteStaffAction(member!.id);
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
          <DialogTitle>{isEditing ? "Edit Staff Member" : "New Staff Member"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                First Name <span className="text-red-400">*</span>
              </label>
              <Input
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Last Name
              </label>
              <Input
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Phone
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Role
              </label>
              <Input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Stylist"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Commission (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={form.commission_pct}
                onChange={(e) => set("commission_pct", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Specialties
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.specialties.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--nova-accent-dim)] text-[var(--nova-accent)] border border-[var(--nova-accent)]/30"
                >
                  {s}
                  <button type="button" onClick={() => removeSpecialty(s)}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={form.specialtyInput}
                onChange={(e) => set("specialtyInput", e.target.value)}
                placeholder="Add specialty"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSpecialty(); }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addSpecialty}>
                Add
              </Button>
            </div>
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
                "Add member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
