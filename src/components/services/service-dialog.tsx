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
import { cn } from "@/lib/utils";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from "@/lib/services/actions";
import type { ServiceWithCategory } from "@/lib/db/queries/services";
import type { ServiceCategory } from "@/lib/db/schema";

const COLOR_OPTIONS = [
  "#8B5CF6", "#6366F1", "#3B82F6", "#0EA5E9",
  "#10B981", "#F59E0B", "#EF4444", "#EC4899",
];

interface ServiceDialogProps {
  service?: ServiceWithCategory;
  categories: ServiceCategory[];
  children: React.ReactNode;
}

export function ServiceDialog({ service, categories, children }: ServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isEditing = !!service;

  const [form, setForm] = useState({
    name: service?.name ?? "",
    description: service?.description ?? "",
    duration_minutes: service?.duration_minutes?.toString() ?? "60",
    price: service?.price ?? "0",
    category_id: service?.category_id ?? "",
    color: service?.color ?? COLOR_OPTIONS[0],
    is_active: service?.is_active ?? true,
  });

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        name: form.name,
        description: form.description || undefined,
        duration_minutes: parseInt(form.duration_minutes),
        price: form.price,
        category_id: form.category_id || undefined,
        color: form.color,
        is_active: form.is_active,
      };
      if (isEditing) {
        await updateServiceAction(service.id, data);
      } else {
        await createServiceAction(data);
      }
      setOpen(false);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteServiceAction(service!.id);
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
          <DialogTitle>{isEditing ? "Edit Service" : "New Service"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Haircut"
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Optional description"
              className={cn(
                "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                "px-3 py-2 text-sm text-[var(--nova-text)] placeholder:text-[var(--nova-muted)]",
                "focus:outline-none focus:border-[var(--nova-accent)] resize-none transition-colors"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Duration (minutes)
              </label>
              <Input
                type="number"
                min="5"
                step="5"
                value={form.duration_minutes}
                onChange={(e) => set("duration_minutes", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
                Price (R)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Category
            </label>
            <select
              value={form.category_id}
              onChange={(e) => set("category_id", e.target.value)}
              className={cn(
                "w-full rounded-xl border border-[var(--nova-border)] bg-[var(--nova-surface)]",
                "px-3 py-2 text-sm text-[var(--nova-text)]",
                "focus:outline-none focus:border-[var(--nova-accent)] transition-colors"
              )}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--nova-muted)] mb-1.5">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set("color", color)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    form.color === color
                      ? "border-white scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {isEditing && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
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
                "Create service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
