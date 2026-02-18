import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  AlertTriangle,
  BookOpen,
  Calendar,
  Library,
  BrainCircuit,
  Zap,
} from 'lucide-react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ARAMIS BRAIN v0.1',
  description: 'Centre de Commandement Exécutif',
};

const navLinks = [
  { href: '/dashboard', label: 'Cockpit', icon: LayoutDashboard },
  { href: '/focus', label: 'Focus', icon: Target },
  { href: '/risks', label: 'Risques', icon: AlertTriangle },
  { href: '/decisions', label: 'Décisions', icon: BookOpen },
  { href: '/events', label: 'Événements', icon: Calendar },
  { href: '/playbooks', label: 'Playbooks', icon: Library },
  { href: '/ai-chat', label: 'IA', icon: BrainCircuit },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            {/* Navigation — Glassmorphism */}
            <nav className="glass sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-6 py-2.5">
                <div className="flex items-center justify-between">
                  {/* Logo */}
                  <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-7 h-7 rounded-lg bg-gold-primary/10 flex items-center justify-center group-hover:bg-gold-primary/20 transition-colors">
                      <Zap size={14} className="text-gold-primary" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-wider text-gold-primary">
                      ARAMIS BRAIN
                    </span>
                  </Link>

                  {/* Nav Links */}
                  <div className="flex items-center gap-0.5">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200"
                      >
                        <Icon size={13} strokeWidth={1.75} />
                        <span className="font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main>{children}</main>
          </Providers>
        </ErrorBoundary>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(26,26,26,0.9)',
              backdropFilter: 'blur(16px)',
              color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            },
            className: 'font-sans',
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
