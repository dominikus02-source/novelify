'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Key, Bell, CreditCard, Globe, Shield, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const sections = [
  {
    icon: User, label: 'Profile', desc: 'Name, email, and avatar',
    color: 'bg-amber/10', iconColor: 'text-amber',
  },
  {
    icon: CreditCard, label: 'Billing', desc: 'Plan, payment, and invoices',
    color: 'bg-emerald-50', iconColor: 'text-emerald-600',
  },
  {
    icon: Key, label: 'API Keys', desc: 'Manage API integrations',
    color: 'bg-violet-50', iconColor: 'text-violet-600',
  },
  {
    icon: Bell, label: 'Notifications', desc: 'Email and in-app preferences',
    color: 'bg-sky-50', iconColor: 'text-sky-600',
  },
  {
    icon: Globe, label: 'Language & Region', desc: 'Default translation languages, timezone',
    color: 'bg-amber/10', iconColor: 'text-amber',
  },
  {
    icon: Shield, label: 'Privacy & Security', desc: 'Data export, account deletion',
    color: 'bg-rose-50', iconColor: 'text-rose-600',
  },
];

export function SettingsPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className="group cursor-pointer border-border/50 bg-white shadow-sm transition-all hover:shadow-md hover:border-amber/30"
                  onClick={() => setSelected(selected === section.label ? null : section.label)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${section.color}`}>
                      <Icon className={`size-5 ${section.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-ink group-hover:text-amber transition-colors">{section.label}</h3>
                      <p className="text-sm text-muted-foreground">{section.desc}</p>
                    </div>
                    <ChevronRight className={`size-5 text-muted-foreground transition-transform ${selected === section.label ? 'rotate-90' : ''}`} />
                  </CardContent>
                  {selected === section.label && (
                    <div className="border-t border-border/50 px-4 py-6 text-center text-sm text-muted-foreground">
                      Coming soon — this section is under development.
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border/50 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Running Novelify v0.2.0 &middot; Built with Next.js + Prisma + Neon
          </p>
        </div>
      </div>
    </div>
  );
}
