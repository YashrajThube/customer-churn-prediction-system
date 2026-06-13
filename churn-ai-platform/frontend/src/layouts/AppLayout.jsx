import { createElement, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Gauge, History, Settings, Sparkles, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import logo from '@/assets/churnx-logo.svg'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useApiHealth } from '@/hooks/useApiHealth'
import { useAppStore } from '@/hooks/useAppStore'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/prediction', label: 'Prediction', icon: Sparkles },
  { to: '/history', label: 'History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function AppLayout() {
  const { pathname } = useLocation()
  const theme = useAppStore((state) => state.theme)
  const user = useAppStore((state) => state.user)
  const healthQuery = useApiHealth()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const apiStatus = healthQuery.data?.system?.api_status || 'UNKNOWN'
  const latency = Number(healthQuery.data?.model?.drift_score || 0)

  return (
    <div className="min-h-screen px-3 py-3 md:px-5 md:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-[1600px] gap-3 md:gap-4">
        <aside className="hidden w-72 rounded-[28px] border border-white/50 bg-white/55 p-4 shadow-[0_25px_50px_rgba(15,37,87,0.12)] backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/60 lg:flex lg:flex-col">
          <div className="mb-8 flex items-center gap-3 rounded-3xl bg-white/80 p-3 dark:bg-slate-900/70">
            <img src={logo} alt="ChurnX AI" className="h-12 w-12 rounded-2xl" />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[#1D1D1F] dark:text-white">ChurnX AI</h1>
              <p className="text-xs text-[#636778] dark:text-slate-300">Predict. Prevent. Retain.</p>
            </div>
          </div>

          <nav className="space-y-2">
            {LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                    isActive
                      ? 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white shadow-[0_12px_28px_rgba(46,97,236,0.35)]'
                      : 'text-[#3b3f4d] hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800/85',
                  ].join(' ')
                }
              >
                {createElement(item.icon, { size: 18 })}
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/75">
            <p className="text-xs uppercase tracking-[0.14em] text-[#727688] dark:text-slate-400">Workspace</p>
            <p className="mt-2 text-sm font-semibold text-[#1D1D1F] dark:text-white">{user.name}</p>
            <p className="text-xs text-[#727688] dark:text-slate-400">{user.role}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col rounded-[28px] border border-white/60 bg-white/45 shadow-[0_25px_50px_rgba(15,37,87,0.1)] backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/45">
          <header className="border-b border-white/55 px-4 py-3 dark:border-slate-700 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-[#1D1D1F] dark:text-white">ML Intelligence Console</h2>
                <p className="text-sm text-[#5f6475] dark:text-slate-400">Production-grade decision support for churn prevention</p>
              </div>
              <ThemeToggle />
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 font-semibold text-[#2f3546] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                API {apiStatus}
              </span>
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 font-semibold text-[#2f3546] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Drift score {latency.toFixed(3)}
              </span>
              <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 font-semibold text-[#2f3546] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Last update {healthQuery.dataUpdatedAt ? new Date(healthQuery.dataUpdatedAt).toLocaleTimeString() : '--'}
              </span>
            </div>
            <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {LINKS.map((item) => (
                <NavLink
                  key={`mobile-${item.to}`}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition',
                      isActive
                        ? 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white'
                        : 'bg-white/75 text-[#2e3446] dark:bg-slate-800 dark:text-slate-300',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
