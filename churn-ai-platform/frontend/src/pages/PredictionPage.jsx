import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BatchPredictionCard } from '@/components/Prediction/BatchPredictionCard'
import { PredictionOutputCard } from '@/components/Prediction/PredictionOutputCard'
import { getBatchJobStatus, predict, uploadBatchCsv } from '@/services/predictionService'
import { useAppStore } from '@/hooks/useAppStore'
import { formatPercent, normalizePredictionPayload } from '@/utils/formatters'

const DEFAULT_EXISTING = { customer_id: 'CUST-1001' }

const DEFAULT_NEW = {
  customer_id: 'NEW-1001',
  age: 34,
  tenure: 8,
  monthly_charges: 79.5,
  contract_type: 'Month-to-month',
  internet_service: 'Fiber optic',
  payment_method: 'Electronic check',
}

const NEW_SAMPLES = [
  {
    label: 'Likely Churn',
    data: {
      customer_id: 'NEW-911',
      age: 26,
      tenure: 2,
      monthly_charges: 98.1,
      contract_type: 'Month-to-month',
      internet_service: 'Fiber optic',
      payment_method: 'Electronic check',
    },
  },
  {
    label: 'Stable',
    data: {
      customer_id: 'NEW-120',
      age: 52,
      tenure: 41,
      monthly_charges: 58.3,
      contract_type: 'Two year',
      internet_service: 'DSL',
      payment_method: 'Bank transfer',
    },
  },
]

export default function PredictionPage() {
  const [mode, setMode] = useState('existing')
  const [existingCustomer, setExistingCustomer] = useState(DEFAULT_EXISTING)
  const [newCustomer, setNewCustomer] = useState(DEFAULT_NEW)
  const [errorText, setErrorText] = useState('')
  const [copiedOutput, setCopiedOutput] = useState(false)

  const [batchFile, setBatchFile] = useState(null)
  const [batchJobId, setBatchJobId] = useState('')
  const [batchStatus, setBatchStatus] = useState(null)
  const [batchError, setBatchError] = useState('')

  const setLatestPrediction = useAppStore((state) => state.setLatestPrediction)
  const latestPrediction = useAppStore((state) => state.latestPrediction)

  const predictionMutation = useMutation({
    mutationFn: predict,
    onSuccess: (data) => {
      const normalized = normalizePredictionPayload(data)
      setLatestPrediction({
        ...normalized,
        timestamp: new Date().toISOString(),
      })
      setErrorText('')
    },
    onError: (error) => {
      setErrorText(error.message)
    },
  })

  const batchUploadMutation = useMutation({
    mutationFn: (file) => uploadBatchCsv(file, { returnProba: true, explain: true }),
    onSuccess: (data) => {
      setBatchJobId(data.job_id)
      setBatchError('')
    },
    onError: (error) => {
      setBatchError(error.message)
    },
  })

  useEffect(() => {
    if (!batchJobId) return
    let active = true

    const run = async () => {
      try {
        const status = await getBatchJobStatus(batchJobId)
        if (!active) return
        setBatchStatus(status)
      } catch (error) {
        if (!active) return
        setBatchError(error.message)
      }
    }

    run()
    const timer = setInterval(run, 1500)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [batchJobId])

  const handlePredict = () => {
    if (mode === 'existing') {
      if (!existingCustomer.customer_id?.trim()) {
        setErrorText('Customer ID is required in Existing Customer mode.')
        return
      }
      predictionMutation.mutate({ customer_id: existingCustomer.customer_id.trim() })
      return
    }

    if (newCustomer.age === '' || newCustomer.tenure === '' || newCustomer.monthly_charges === '') {
      setErrorText('Age, tenure, and monthly charges are required for New Customer mode.')
      return
    }

    predictionMutation.mutate(newCustomer)
  }

  const updateNewField = (field, value) => setNewCustomer((prev) => ({ ...prev, [field]: value }))

  const getRiskColor = (probability) => {
    const prob = Number(probability)
    if (prob >= 0.7) return { bg: 'bg-rose-500/20', text: 'text-rose-700', label: 'High Risk' }
    if (prob >= 0.4) return { bg: 'bg-amber-500/20', text: 'text-amber-700', label: 'Medium Risk' }
    return { bg: 'bg-emerald-500/20', text: 'text-emerald-700', label: 'Low Risk' }
  }

  const copyOutput = () => {
    if (!latestPrediction) return
    const text = `Churn Prediction Results
Prediction: ${Number(latestPrediction.prediction) === 1 ? 'Churn' : 'Not Churn'}
Probability: ${formatPercent(latestPrediction.probability)}
Risk: ${latestPrediction.risk}
Confidence: ${formatPercent(latestPrediction.confidence)}
Latency: ${latestPrediction.latencyMs.toFixed(1)} ms`
    navigator.clipboard.writeText(text)
    setCopiedOutput(true)
    setTimeout(() => setCopiedOutput(false), 2000)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <Card title="ML Prediction Input" subtitle="Choose mode and run real-time backend inference">
          <div className="mb-4 flex gap-2 rounded-2xl bg-[#eef3fb] p-1 dark:bg-slate-800/70">
            <button
              onClick={() => {
                setMode('existing')
                setErrorText('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'existing'
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white shadow-[0_10px_24px_rgba(10,132,255,0.25)]'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Existing Customer
            </button>
            <button
              onClick={() => {
                setMode('new')
                setErrorText('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'new'
                  ? 'bg-gradient-to-r from-[#0A84FF] to-[#5E5CE6] text-white shadow-[0_10px_24px_rgba(10,132,255,0.25)]'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              New Customer
            </button>
          </div>

          {mode === 'existing' ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <label className="mb-2 block text-sm font-medium text-[#384056] dark:text-slate-300">Customer ID</label>
                <Input
                  value={existingCustomer.customer_id}
                  onChange={(event) => setExistingCustomer({ customer_id: event.target.value })}
                  placeholder="CUST-1001"
                />
                <p className="mt-2 text-xs text-[#6c7287] dark:text-slate-400">
                  Uses existing customer profile from backend dataset and feature store.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
              <div className="rounded-2xl bg-[#eef4ff] p-3 dark:bg-slate-800/50">
                <p className="mb-2 text-xs font-medium text-[#4a587a] dark:text-slate-300">Quick new-customer presets:</p>
                <div className="flex flex-wrap gap-2">
                  {NEW_SAMPLES.map((sample) => (
                    <button
                      key={sample.label}
                      onClick={() => setNewCustomer(sample.data)}
                      className="rounded-full border border-[#d7e3fa] bg-white px-3 py-1 text-xs font-medium text-[#365082] transition hover:border-[#0A84FF] hover:text-[#0A84FF] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Customer ID</label>
                  <Input value={newCustomer.customer_id} onChange={(event) => updateNewField('customer_id', event.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Age</label>
                  <Input type="number" value={newCustomer.age} onChange={(event) => updateNewField('age', Number(event.target.value || 0))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Tenure (months)</label>
                  <Input type="number" value={newCustomer.tenure} onChange={(event) => updateNewField('tenure', Number(event.target.value || 0))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Monthly Charges ($)</label>
                  <Input type="number" step="0.01" value={newCustomer.monthly_charges} onChange={(event) => updateNewField('monthly_charges', Number(event.target.value || 0))} />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Contract Type</label>
                  <select
                    value={newCustomer.contract_type}
                    onChange={(event) => updateNewField('contract_type', event.target.value)}
                    className="w-full rounded-2xl border border-[#d8deee] bg-white/90 px-4 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Month-to-month">Month-to-month</option>
                    <option value="One year">One year</option>
                    <option value="Two year">Two year</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Internet Service</label>
                  <select
                    value={newCustomer.internet_service}
                    onChange={(event) => updateNewField('internet_service', event.target.value)}
                    className="w-full rounded-2xl border border-[#d8deee] bg-white/90 px-4 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="DSL">DSL</option>
                    <option value="Fiber optic">Fiber optic</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-[#4e5875] dark:text-slate-400">Payment Method</label>
                  <select
                    value={newCustomer.payment_method}
                    onChange={(event) => updateNewField('payment_method', event.target.value)}
                    className="w-full rounded-2xl border border-[#d8deee] bg-white/90 px-4 py-2.5 text-sm text-[#1D1D1F] outline-none transition focus:border-[#0A84FF] focus:ring-2 focus:ring-[#0A84FF]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Electronic check">Electronic check</option>
                    <option value="Mailed check">Mailed check</option>
                    <option value="Bank transfer">Bank transfer</option>
                    <option value="Credit card">Credit card</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={handlePredict} disabled={predictionMutation.isPending}>
              {predictionMutation.isPending ? 'Predicting...' : 'Predict Churn'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setExistingCustomer(DEFAULT_EXISTING)
                setNewCustomer(DEFAULT_NEW)
                setErrorText('')
              }}
            >
              Reset
            </Button>
          </div>

          {errorText ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{errorText}</p> : null}
        </Card>

        <BatchPredictionCard
          batchFile={batchFile}
          setBatchFile={setBatchFile}
          submitBatch={() => batchFile && batchUploadMutation.mutate(batchFile)}
          isSubmitting={batchUploadMutation.isPending}
          batchJobId={batchJobId}
          batchStatus={batchStatus}
          batchError={batchError}
        />
      </div>

      <div className="space-y-4">
        <PredictionOutputCard
          latestPrediction={latestPrediction}
          getRiskColor={getRiskColor}
          copyOutput={copyOutput}
          copiedOutput={copiedOutput}
        />
      </div>
    </div>
  )
}
