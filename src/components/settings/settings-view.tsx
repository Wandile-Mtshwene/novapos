"use client";

import { Building2, Bell, Palette, ShieldCheck, ReceiptText, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveBusinessSettingsAction, saveReceiptSettingsAction } from "@/lib/settings/actions";
import type { Organization, Settings } from "@/lib/db/schema";

type SettingsTab = "business" | "notifications" | "appearance" | "receipts" | "security";

const TABS: { value: SettingsTab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { value: "business", label: "Business", icon: Building2 },
  { value: "receipts", label: "Receipts", icon: ReceiptText },
  { value: "appearance", label: "Appearance", icon: Palette },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "security", label: "Security", icon: ShieldCheck },
];

const ACCENT_COLORS = [
  { label: "Purple", accent: "#8B5CF6", accentDim: "#8B5CF620" },
  { label: "Blue", accent: "#3B82F6", accentDim: "#3B82F620" },
  { label: "Emerald", accent: "#10B981", accentDim: "#10B98120" },
  { label: "Rose", accent: "#F43F5E", accentDim: "#F43F5E20" },
  { label: "Amber", accent: "#F59E0B", accentDim: "#F59E0B20" },
  { label: "Cyan", accent: "#06B6D4", accentDim: "#06B6D420" },
];

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm text-[var(--nova-muted)]">{label}</Label>
      {children}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--nova-text)]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--nova-muted)] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

interface SettingsViewProps {
  organization: Organization | null;
  settings: Settings | null;
}

export function SettingsView({ organization, settings }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [isSavingBiz, startBizTransition] = useTransition();
  const [isSavingReceipt, startReceiptTransition] = useTransition();
  const [selectedAccent, setSelectedAccent] = useState<string>("#8B5CF6");

  const [bizForm, setBizForm] = useState({
    name: organization?.name ?? "",
    phone: organization?.phone ?? "",
    email: organization?.email ?? "",
    address: organization?.address ?? "",
  });

  const [receiptForm, setReceiptForm] = useState({
    receipt_footer: settings?.receipt_footer ?? "",
    tax_rate: settings?.tax_rate ?? "15",
    tip_enabled: settings?.tip_enabled ?? true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("nova-accent-color");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.accent) {
          setSelectedAccent(parsed.accent.toUpperCase());
          document.documentElement.style.setProperty("--nova-accent", parsed.accent);
          document.documentElement.style.setProperty("--nova-accent-dim", parsed.accentDim);
        }
      } catch {
      }
    }
  }, []);

  function applyAccentColor(accent: string, accentDim: string) {
    document.documentElement.style.setProperty("--nova-accent", accent);
    document.documentElement.style.setProperty("--nova-accent-dim", accentDim);
    localStorage.setItem("nova-accent-color", JSON.stringify({ accent, accentDim }));
    setSelectedAccent(accent.toUpperCase());
  }

  function setBiz(field: string, value: string) {
    setBizForm((f) => ({ ...f, [field]: value }));
  }

  function setReceipt(field: string, value: string | boolean) {
    setReceiptForm((f) => ({ ...f, [field]: value }));
  }

  function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    startBizTransition(async () => {
      await saveBusinessSettingsAction(bizForm);
    });
  }

  function handleSaveReceipt(e: React.FormEvent) {
    e.preventDefault();
    startReceiptTransition(async () => {
      await saveReceiptSettingsAction({
        receipt_footer: receiptForm.receipt_footer || undefined,
        tax_rate: receiptForm.tax_rate,
        tip_enabled: receiptForm.tip_enabled as boolean,
      });
    });
  }

  return (
    <div className="flex h-full flex-col md:flex-row gap-0">
      {/* Settings nav */}
      <nav className="shrink-0 border-b border-[var(--nova-border)] md:border-b-0 md:border-r md:w-48 md:p-3 md:space-y-0.5">
        <div className="flex overflow-x-auto md:flex-col gap-0.5 p-3 md:p-0">
          {TABS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                "md:w-full",
                activeTab === value
                  ? "bg-[var(--nova-accent-dim)] text-[var(--nova-accent)]"
                  : "text-[var(--nova-muted)] hover:bg-[var(--nova-tint-2)] hover:text-[var(--nova-text)]"
              )}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6 space-y-5">
        {activeTab === "business" && (
          <form onSubmit={handleSaveBusiness}>
            <Section
              title="Business Information"
              description="Your business details appear on receipts and customer communications."
            >
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <FieldGroup label="Business Name">
                  <Input
                    value={bizForm.name}
                    onChange={(e) => setBiz("name", e.target.value)}
                    placeholder="My Barbershop"
                    className="h-9 bg-[var(--nova-tint-2)] border-[var(--nova-border)]"
                  />
                </FieldGroup>
                <FieldGroup label="Phone Number">
                  <Input
                    type="tel"
                    value={bizForm.phone}
                    onChange={(e) => setBiz("phone", e.target.value)}
                    placeholder="+27 21 000 0000"
                    className="h-9 bg-[var(--nova-tint-2)] border-[var(--nova-border)]"
                  />
                </FieldGroup>
                <FieldGroup label="Email Address">
                  <Input
                    type="email"
                    value={bizForm.email}
                    onChange={(e) => setBiz("email", e.target.value)}
                    placeholder="hello@mybusiness.co.za"
                    className="h-9 bg-[var(--nova-tint-2)] border-[var(--nova-border)]"
                  />
                </FieldGroup>
              </div>
              <FieldGroup label="Business Address">
                <Textarea
                  value={bizForm.address}
                  onChange={(e) => setBiz("address", e.target.value)}
                  placeholder="123 Main Street, Cape Town, 8001"
                  className="bg-[var(--nova-tint-2)] border-[var(--nova-border)]"
                  rows={2}
                />
              </FieldGroup>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingBiz}
                  className="w-full md:w-auto bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white"
                >
                  {isSavingBiz ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </Section>
          </form>
        )}

        {activeTab === "receipts" && (
          <form onSubmit={handleSaveReceipt}>
            <Section
              title="Receipt Settings"
              description="Customize what appears on printed and digital receipts."
            >
              <FieldGroup label="Receipt Footer">
                <Textarea
                  value={receiptForm.receipt_footer}
                  onChange={(e) => setReceipt("receipt_footer", e.target.value)}
                  placeholder="Thank you for visiting! See you next time."
                  className="bg-[var(--nova-tint-2)] border-[var(--nova-border)]"
                  rows={3}
                />
              </FieldGroup>
              <FieldGroup label="VAT Rate (%)">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={receiptForm.tax_rate}
                  onChange={(e) => setReceipt("tax_rate", e.target.value)}
                  className="h-9 bg-[var(--nova-tint-2)] border-[var(--nova-border)] w-32"
                />
              </FieldGroup>
              <div className="flex items-center justify-between rounded-xl border border-[var(--nova-border)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--nova-text)]">Enable tips</p>
                  <p className="text-xs text-[var(--nova-muted)] mt-0.5">
                    Allow customers to add a tip at checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReceipt("tip_enabled", !(receiptForm.tip_enabled as boolean))}
                  className={cn(
                    "h-5 w-9 rounded-full cursor-pointer relative transition-colors",
                    receiptForm.tip_enabled ? "bg-[var(--nova-accent)]" : "bg-[var(--nova-tint-3)]"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                      receiptForm.tip_enabled ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingReceipt}
                  className="w-full md:w-auto bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white"
                >
                  {isSavingReceipt ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </Section>
          </form>
        )}

        {activeTab === "appearance" && (
          <Section title="Appearance" description="Customize the look and feel of your NovaPOS.">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--nova-text)]">Accent Color</p>
              <div className="flex flex-wrap gap-3">
                {ACCENT_COLORS.map(({ label, accent, accentDim }) => {
                  const isSelected = selectedAccent === accent.toUpperCase();
                  return (
                    <button
                      key={accent}
                      type="button"
                      title={label}
                      onClick={() => applyAccentColor(accent, accentDim)}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center",
                        isSelected
                          ? "border-white shadow-lg scale-110"
                          : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ backgroundColor: accent }}
                    >
                      {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--nova-muted)]">
                Click a color to apply it instantly. Your choice is saved across sessions.
              </p>
            </div>
          </Section>
        )}

        {(activeTab === "notifications" || activeTab === "security") && (
          <Section
            title={activeTab === "notifications" ? "Notifications" : "Security"}
          >
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--nova-accent-dim)] mb-3">
                {activeTab === "notifications" ? (
                  <Bell size={20} className="text-[var(--nova-accent)]" />
                ) : (
                  <ShieldCheck size={20} className="text-[var(--nova-accent)]" />
                )}
              </div>
              <p className="text-sm text-[var(--nova-muted)]">Coming soon</p>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
