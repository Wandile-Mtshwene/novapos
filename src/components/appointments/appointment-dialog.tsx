"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  createAppointmentAction,
  updateAppointmentAction,
  deleteAppointmentAction,
} from "@/lib/appointments/actions";
import type { AppointmentWithRelations } from "@/lib/db/queries/appointments";
import type { ServiceWithCategory } from "@/lib/db/queries/services";
import type { Staff, Customer } from "@/lib/db/schema";

interface AppointmentDialogProps {
  appointment?: AppointmentWithRelations;
  services: ServiceWithCategory[];
  staff: Staff[];
  customers: Customer[];
  defaultDate?: string;
  children: React.ReactNode;
}

export function AppointmentDialog({
  appointment,
  services,
  staff,
  customers,
  defaultDate,
  children,
}: AppointmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isEditing = !!appointment;

  const defaultStartsAt = defaultDate
    ? `${defaultDate}T09:00`
    : appointment?.starts_at
    ? new Date(appointment.starts_at).toISOString().slice(0, 16)
    : "";

  const [form, setForm] = useState({
    customer_id: appointment?.customer_id ?? "",
    staff_id: appointment?.staff_id ?? "",
    service_id: appointment?.service_id ?? "",
    starts_at: defaultStartsAt,
    notes: appointment?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.service_id || !form.starts_at) return;

    const selectedService = services.find((s) => s.id === form.service_id);
    const durationMinutes = selectedService?.duration_minutes ?? 60;
    const startsAt = new Date(form.starts_at);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
    const price = selectedService?.price ?? "0";

    startTransition(async () => {
      if (isEditing) {
        await updateAppointmentAction(appointment.id, {
          customer_id: form.customer_id || undefined,
          staff_id: form.staff_id || undefined,
          service_id: form.service_id,
          starts_at: startsAt,
          ends_at: endsAt,
          price,
          notes: form.notes || undefined,
        });
      } else {
        await createAppointmentAction({
          customer_id: form.customer_id || undefined,
          staff_id: form.staff_id || undefined,
          service_id: form.service_id,
          starts_at: startsAt,
          ends_at: endsAt,
          price,
          notes: form.notes || undefined,
        });
      }
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteAppointmentAction(appointment!.id);
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
          <DialogTitle>{isEditing ? "Edit Appointment" : "New Appointment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Service <span className="text-red-400">*</span>
            </label>
            <select
              value={form.service_id}
              onChange={(e) => set("service_id", e.target.value)}
              required
              className={cn(
                "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                "px-3 py-2 text-sm text-[var(--nova-text)]",
                "focus:outline-none focus:border-[var(--nova-accent)]",
                "transition-colors"
              )}
            >
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration_minutes}min)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Customer
              </label>
              <select
                value={form.customer_id}
                onChange={(e) => set("customer_id", e.target.value)}
                className={cn(
                  "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                  "px-3 py-2 text-sm text-[var(--nova-text)]",
                  "focus:outline-none focus:border-[var(--nova-accent)]",
                  "transition-colors"
                )}
              >
                <option value="">Walk-in</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Staff
              </label>
              <select
                value={form.staff_id}
                onChange={(e) => set("staff_id", e.target.value)}
                className={cn(
                  "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                  "px-3 py-2 text-sm text-[var(--nova-text)]",
                  "focus:outline-none focus:border-[var(--nova-accent)]",
                  "transition-colors"
                )}
              >
                <option value="">Any staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Date and Time <span className="text-red-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Any notes..."
              className={cn(
                "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                "px-3 py-2 text-sm text-[var(--nova-text)] placeholder:text-[var(--nova-muted)]",
                "focus:outline-none focus:border-[var(--nova-accent)]",
                "resize-none transition-colors"
              )}
            />
          </div>

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Book appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
