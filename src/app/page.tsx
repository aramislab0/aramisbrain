import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';

const modules = [
  {
    title: 'Cockpit Global',
    description: "Vue d'ensemble de tous vos projets",
    icon: LayoutDashboard,
    href: '/dashboard',
    color: '#D4AF37',
  },
  {
    title: 'Focus du Jour',
    description: '3 priorités quotidiennes',
    icon: Target,
    href: '/focus',
    color: '#10B981',
  },
  {
    title: 'Radar de Risques',
    description: 'Surveillance multi-dimensionnelle',
    icon: AlertTriangle,
    href: '/risks',
    color: '#F59E0B',
  },
  {
    title: 'Décisions',
    description: 'Journal décisionnel structuré',
    icon: BookOpen,
    href: '/decisions',
    color: '#3B82F6',
  },
  {
    title: 'Événements',
    description: 'Timeline et jalons clés',
    icon: Calendar,
    href: '/events',
    color: '#8B5CF6',
  },
  {
    title: 'Dialogue IA',
    description: 'Assistant exécutif intelligent',
    icon: BrainCircuit,
    href: '/ai-chat',
    color: '#EC4899',
  },
];

const statusItems = [
  { label: 'Next.js 16', status: 'Opérationnel', ok: true },
  { label: 'Tailwind CSS v4', status: 'Silent Command', ok: true },
  { label: 'Lucide Icons', status: 'Intégré', ok: true },
  { label: 'Supabase', status: 'Connecté', ok: true },
  { label: 'OpenAI API', status: 'À configurer', ok: false },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-6xl mx-auto px-8 py-16">

        {/* Hero */}
        <header className="mb-16 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold-primary/10 flex items-center justify-center animate-glow">
              <Zap size={20} className="text-gold-primary" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                ARAMIS BRAIN
              </h1>
              <p className="text-xs text-text-muted tracking-widest uppercase">
                Centre de Commandement Exécutif · v0.1
              </p>
            </div>
          </div>
        </header>

        {/* Modules Grid */}
        <section className="mb-12 animate-fade-in-up">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-5 font-medium">
            Modules
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
            {modules.map(({ title, description, icon: Icon, href, color }) => (
              <Link
                key={href}
                href={href}
                className="group relative glass-subtle hover:bg-white/[0.04] rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}15` }}
                    >
                      <Icon size={17} strokeWidth={1.75} style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-0.5">
                        {title}
                      </h3>
                      <p className="text-[11px] text-text-muted leading-relaxed">{description}</p>
                    </div>
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-text-muted/30 group-hover:text-gold-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Status */}
        <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-4 font-medium">
            Infrastructure
          </p>
          <div className="glass-subtle rounded-2xl overflow-hidden">
            {statusItems.map(({ label, status, ok }, i) => (
              <div
                key={label}
                className={`flex items-center justify-between px-5 py-3 ${i < statusItems.length - 1 ? 'border-b border-white/[0.03]' : ''
                  }`}
              >
                <span className="text-xs text-text-secondary">{label}</span>
                <div className="flex items-center gap-2">
                  {ok ? (
                    <CheckCircle2 size={12} className="text-success" />
                  ) : (
                    <Clock size={12} className="text-text-muted" />
                  )}
                  <span
                    className={`text-[11px] font-medium ${ok ? 'text-success/80' : 'text-text-muted'
                      }`}
                  >
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
