import { z } from "zod";

export const appointmentSchema = z.object({
  service_id: z.string().min(1, "Service is required"),
  customer_id: z.string().optional(),
  staff_id: z.string().optional(),
  starts_at: z.string().min(1, "Start time is required"),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  duration_minutes: z.number().int().min(5, "Minimum 5 minutes").max(480),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  category_id: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").optional(),
  is_active: z.boolean().optional(),
});

export const customerSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  birthday: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  sku: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  category_id: z.string().optional(),
  cost_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  selling_price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  stock_quantity: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const staffSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  role: z.string().max(50).optional(),
  commission_pct: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid percentage").optional(),
  specialties: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});

export const businessSettingsSchema = z.object({
  name: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().max(500).optional(),
});

export const receiptSettingsSchema = z.object({
  receipt_footer: z.string().max(500).optional(),
  tax_rate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid rate").optional(),
  tip_enabled: z.boolean().optional(),
});
