import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#70b8ff', '#0A84FF', '#5e5ce6']

export function RiskDistributionChart({ data = {} }) {
  const chartData = [
    { name: 'Low', value: Number(data.low || 0) },
    { name: 'Medium', value: Number(data.medium || 0) },
    { name: 'High', value: Number(data.high || 0) },
  ]

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => Number(value).toLocaleString()} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
