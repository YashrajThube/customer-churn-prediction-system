import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatPercent } from '@/utils/formatters'

export function PredictionOutputCard({ latestPrediction, getRiskColor, copyOutput, copiedOutput }) {
  return (
    <Card title="Prediction Output" subtitle="Live inference result from backend model">
      {latestPrediction ? (
        <motion.div className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          {(() => {
            const riskColor = getRiskColor(latestPrediction.probability)
            const isPredictingChurn = Number(latestPrediction.prediction) === 1
            return (
              <div className={`rounded-2xl ${riskColor.bg} p-4`}>
                <p className={`text-sm font-medium ${riskColor.text}`}>{riskColor.label}</p>
                <p className={`mt-2 text-3xl font-bold ${riskColor.text}`}>
                  {latestPrediction.predictionLabel || (isPredictingChurn ? 'Churn' : 'Not Churn')}
                </p>
              </div>
            )
          })()}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/85 p-3 dark:bg-slate-900/85">
              <p className="text-[#69708b] dark:text-slate-400">Probability</p>
              <p className="mt-1 text-lg font-semibold text-[#1D1D1F] dark:text-white">
                {formatPercent(latestPrediction.probability)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/85 p-3 dark:bg-slate-900/85">
              <p className="text-[#69708b] dark:text-slate-400">Confidence</p>
              <p className="mt-1 text-lg font-semibold text-[#1D1D1F] dark:text-white">
                {formatPercent(latestPrediction.confidence)}
              </p>
              <p className="mt-1 text-xs text-[#6f7691] dark:text-slate-400">{latestPrediction.confidenceLabel || 'Medium'} confidence</p>
            </div>
            <div className="rounded-2xl bg-white/85 p-3 dark:bg-slate-900/85">
              <p className="text-[#69708b] dark:text-slate-400">Model Risk</p>
              <p className="mt-1 text-lg font-semibold text-[#1D1D1F] dark:text-white">
                {latestPrediction.risk}
              </p>
            </div>
            <div className="rounded-2xl bg-white/85 p-3 dark:bg-slate-900/85">
              <p className="text-[#69708b] dark:text-slate-400">Response Time</p>
              <p className="mt-1 text-lg font-semibold text-[#1D1D1F] dark:text-white">
                {latestPrediction.latencyMs.toFixed(1)} ms
              </p>
            </div>
          </div>

          {latestPrediction.explanationText ? (
            <div className="rounded-2xl border border-[#dce6fa] bg-white/80 p-4 text-sm text-[#39405a] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
              <p className="mb-2 font-medium text-[#1D1D1F] dark:text-white">Prediction summary</p>
              {latestPrediction.explanationText}
            </div>
          ) : null}

          <button
            onClick={copyOutput}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            {copiedOutput ? (
              <>
                <Check size={16} /> Copied to clipboard
              </>
            ) : (
              <>
                <Copy size={16} /> Copy results
              </>
            )}
          </button>
        </motion.div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-800/50">
          <p className="text-sm text-[#69708b] dark:text-slate-400">
            Prediction Output appears here after you run inference.
          </p>
        </div>
      )}
    </Card>
  )
}
