import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { RiskDistributionChart } from '@/components/charts/RiskDistributionChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { getDashboard, getHistory } from '@/services/dashboardService'
import { formatDateTime, formatNumber, formatPercent } from '@/utils/formatters'

function MetricCard({ title, value, hint, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden">
        <div className="absolute -right-9 -top-9 h-24 w-24 rounded-full bg-gradient-to-br from-[#0A84FF]/20 to-[#5E5CE6]/20 blur-xl" />
        <p className="relative text-xs uppercase tracking-[0.14em] text-[#68708a] dark:text-slate-400">{title}</p>
        <p className="relative mt-3 text-3xl font-semibold text-[#1D1D1F] dark:text-white">{value}</p>
        <p className="relative mt-2 text-sm text-[#68708a] dark:text-slate-400">{hint}</p>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 24],
    queryFn: () => getDashboard(24),
  })

  const historyQuery = useQuery({
    queryKey: ['recent-history'],
    queryFn: () => getHistory(8, 0),
  })

  if (dashboardQuery.isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return <ErrorState description={dashboardQuery.error.message} onRetry={dashboardQuery.refetch} />
  }

  const dashboard = dashboardQuery.data
  const historyRows = historyQuery.data?.history || []

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total customers" value={formatNumber(dashboard.total_customers)} hint="Customer records in reference dataset" delay={0.02} />
        <MetricCard title="Predictions" value={formatNumber(dashboard.total_predictions)} hint="Total model inference events" delay={0.06} />
        <MetricCard title="Churn rate" value={formatPercent(dashboard.churn_rate)} hint="Population-level churn signal" delay={0.1} />
        <MetricCard title="High risk" value={formatNumber(dashboard.high_risk_count)} hint={`${formatPercent(dashboard.high_risk_percentage / 100)} of customers`} delay={0.14} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Prediction Trend" subtitle="Rolling 24h event throughput" className="stagger-fade">
          <TrendChart data={dashboard.prediction_trend || dashboard.trend || []} />
        </Card>
        <Card title="Risk Distribution" subtitle="Current model risk segmentation" className="stagger-fade">
          <RiskDistributionChart data={dashboard.risk_distribution || {}} />
        </Card>
      </div>

      <Card title="Recent predictions" subtitle="Latest events from prediction history" className="stagger-fade">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/90 text-[#69708b] dark:border-slate-700 dark:text-slate-400">
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Risk</th>
                <th className="py-3 pr-3">Probability</th>
                <th className="py-3 pr-3">Latency</th>
                <th className="py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row) => (
                <tr key={`${row.customer_id}-${row.timestamp}`} className="border-b border-slate-100 text-[#22252f] dark:border-slate-800 dark:text-slate-200">
                  <td className="py-3 pr-3">{row.customer_id}</td>
                  <td className="py-3 pr-3">{row.risk_level || row.risk || '--'}</td>
                  <td className="py-3 pr-3">{formatPercent(row.probability)}</td>
                  <td className="py-3 pr-3">{Number(row.latency_ms || 0).toFixed(1)} ms</td>
                  <td className="py-3">{formatDateTime(row.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
