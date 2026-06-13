import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { getAllCustomers } from '@/services/customerService'
import { formatPercent, toRiskTone } from '@/utils/formatters'

const PAGE_SIZE = 25

const tones = {
  low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [risk, setRisk] = useState('all')
  const [page, setPage] = useState(1)

  const customersQuery = useQuery({
    queryKey: ['customers-page', search],
    queryFn: () => getAllCustomers({ search }),
  })

  const filtered = useMemo(() => {
    const list = customersQuery.data?.customers || []
    return list.filter((row) => {
      const tone = toRiskTone(row.risk_level || row.risk)
      return risk === 'all' || tone === risk
    })
  }, [customersQuery.data, risk])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-4">
      <Card title="Customers" subtitle="Explore customers with risk segmentation and search.">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by customer id, name, or email" />
          <select
            className="rounded-2xl border border-[#d8deee] bg-white/90 px-4 py-2.5 text-sm text-[#1D1D1F] outline-none focus:border-[#0A84FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={risk}
            onChange={(event) => { setRisk(event.target.value); setPage(1) }}
          >
            <option value="all">All risk levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      <Card title="Customer records" subtitle={`Showing ${filtered.length} matched customers`}>
        {customersQuery.isLoading ? <Skeleton className="h-[460px]" /> : null}
        {customersQuery.isError ? <ErrorState description={customersQuery.error.message} onRetry={customersQuery.refetch} actionLabel="Retry customers" /> : null}
        {!customersQuery.isLoading && !customersQuery.isError ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/90 text-[#69708b] dark:border-slate-700 dark:text-slate-400">
                  <th className="py-3 pr-3">Customer</th>
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Email</th>
                  <th className="py-3 pr-3">Tenure</th>
                  <th className="py-3 pr-3">Monthly Charges</th>
                  <th className="py-3 pr-3">Risk</th>
                  <th className="py-3">Probability</th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => {
                  const tone = toRiskTone(row.risk_level || row.risk)
                  return (
                    <tr key={row.customer_id} className="border-b border-slate-100 text-[#22252f] dark:border-slate-800 dark:text-slate-200">
                      <td className="py-3 pr-3">{row.customer_id}</td>
                      <td className="py-3 pr-3">{row.name || '--'}</td>
                      <td className="py-3 pr-3">{row.email || '--'}</td>
                      <td className="py-3 pr-3">{row.tenure ?? '--'}</td>
                      <td className="py-3 pr-3">{Number(row.monthly_charges || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{String(row.risk_level || row.risk || tone).toUpperCase()}</span>
                      </td>
                      <td className="py-3">{formatPercent(row.prediction_probability || row.probability || 0)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {!customersQuery.isLoading && !customersQuery.isError ? (
          <div className="mt-4 flex items-center justify-between text-sm text-[#5f6475] dark:text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="space-x-2">
              <button className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}>Prev</button>
              <button className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages}>Next</button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
