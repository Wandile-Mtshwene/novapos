"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
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
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
} from "@/lib/customers/actions";
import type { Customer } from "@/lib/db/schema";

interface CustomerDialogProps {
  customer?: Customer;
  children: React.ReactNode;
}

export function CustomerDialog({ customer, children }: CustomerDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isEditing = !!customer;

  const [form, setForm] = useState({
    first_name: customer?.first_name ?? "",
    last_name: customer?.last_name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? "",
    birthday: customer?.birthday ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      if (isEditing) {
        await updateCustomerAction(customer.id, {
          first_name: form.first_name,
          last_name: form.last_name || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          birthday: form.birthday || undefined,
        });
      } else {
        await createCustomerAction({
          first_name: form.first_name,
          last_name: form.last_name || undefined,
          email: form.email || undefined,
          phone: form.phone || undefined,
          birthday: form.birthday || undefined,
        });
      }
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteCustomerAction(customer!.id);
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
          <DialogTitle>{isEditing ? "Edit Customer" : "New Customer"}</DialogTitle>
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
                placeholder="First name"
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
                placeholder="Last name"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="customer@email.com"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Phone
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+27 ..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Birthday
              </label>
              <Input
                type="date"
                value={form.birthday}
                onChange={(e) => set("birthday", e.target.value)}
                className="w-full"
              />
            </div>
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
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Add customer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
