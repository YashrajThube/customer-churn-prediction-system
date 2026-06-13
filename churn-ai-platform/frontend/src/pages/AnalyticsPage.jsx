import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { getAnalytics, getCustomers } from '@/services/analyticsService'
import { formatNumber } from '@/utils/formatters'

function StatCard({ label, value }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#0A84FF]/20 to-[#5E5CE6]/20 blur-xl" />
      <p className="relative text-xs uppercase tracking-[0.14em] text-[#68708a] dark:text-slate-400">{label}</p>
      <p className="relative mt-2 text-3xl font-semibold text-[#1D1D1F] dark:text-white">{value}</p>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [hours, setHours] = useState(24)
  const [search, setSearch] = useState('')

  const analyticsQuery = useQuery({
    queryKey: ['analytics', hours],
    queryFn: () => getAnalytics(hours),
  })

  const customersQuery = useQuery({
    queryKey: ['analytics-customers', search],
    queryFn: () => getCustomers(search),
  })

  const topFeatureRows = useMemo(() => analyticsQuery.data?.top_features || [], [analyticsQuery.data])

  if (analyticsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (analyticsQuery.isError) {
    return <ErrorState description={analyticsQuery.error.message} onRetry={analyticsQuery.refetch} actionLabel="Retry analytics" />
  }

  return (
    <div className="space-y-5">
      <Card title="Analytics Controls" subtitle="Tune trend window and customer filter" className="stagger-fade">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm text-[#5f6475] dark:text-slate-400">
            Trend window (hours)
            <input
              type="range"
              min={6}
              max={168}
              step={6}
              value={hours}
              onChange={(event) => setHours(Number(event.target.value))}
              className="w-full"
            />
            <span className="block text-xs">{hours}h</span>
          </label>
          <label className="space-y-2 text-sm text-[#5f6475] dark:text-slate-400 md:col-span-2">
            Search customers
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer_id, name, email" />
          </label>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value={formatNumber(analyticsQuery.data.total_customers)} />
        <StatCard label="Predictions" value={formatNumber(analyticsQuery.data.total_predictions)} />
        <StatCard label="Customer rows" value={formatNumber(customersQuery.data?.total || 0)} />
        <StatCard label="Window" value={`${hours}h`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Prediction Trend" subtitle="Throughput over selected window" className="stagger-fade">
          <TrendChart data={analyticsQuery.data.trend || []} />
        </Card>
        <Card title="Risk Segmentation" subtitle="Low / Medium / High" className="stagger-fade">
          <RiskDistributionChart data={analyticsQuery.data.risk_distribution || {}} />
        </Card>
      </div>

      <Card title="Top Risk Drivers" subtitle="Aggregated feature impact signals">
        <div className="grid gap-2">
          {topFeatureRows.length === 0 ? <p className="text-sm text-[#69708b] dark:text-slate-400">No feature impact data available yet.</p> : null}
          {topFeatureRows.map((feature, index) => {
            const impact = Number(feature.impact || feature.importance || feature.score || 0)
            const width = Math.min(100, Math.max(2, Math.round(Math.abs(impact) * 100)))
            return (
              <motion.div
                key={`${feature.feature}-${index}`}
                className="rounded-2xl bg-white/85 px-4 py-3 text-sm dark:bg-slate-900/80"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * index, duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#232735] dark:text-slate-200">{feature.feature || feature.name || `Feature ${index + 1}`}</span>
                  <span className="text-[#61667a] dark:text-slate-400">Impact {impact.toFixed(4)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8eefb] dark:bg-slate-700">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6]" style={{ width: `${width}%` }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
