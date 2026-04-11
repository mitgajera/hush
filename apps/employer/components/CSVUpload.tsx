'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { parsePayrollCsv, formatUsdc } from '@shieldpay/umbra-client'
import type { PayrollEntry } from '@shieldpay/umbra-client'

interface Props {
  onParsed: (entries: PayrollEntry[]) => void
}

export function CSVUpload({ onParsed }: Props) {
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [entries, setEntries] = useState<PayrollEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const result = parsePayrollCsv(text)
      setErrors(result.errors)
      setEntries(result.entries)
      if (result.errors.length === 0) {
        onParsed(result.entries)
      }
    }
    reader.readAsText(file)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const totalUsdc = entries.reduce((s, r) => s + r.amount, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? 'var(--umbra-primary)' : 'var(--bd2)'}`,
          background: dragging ? 'var(--umbra-primary-bg)' : 'var(--surface)',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
      >
        <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
          Drop payroll CSV here or click to browse
        </p>
        <p style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 8, fontFamily: 'Space Mono, monospace' }}>
          Format: name, wallet, amount (USDC)
        </p>
        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={onFileChange} />
      </div>

      {errors.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid var(--error)', padding: '12px 16px' }}>
          {errors.map((e, i) => (
            <p key={i} style={{ color: 'var(--error)', fontSize: 12, margin: '2px 0', fontFamily: 'Space Mono, monospace' }}>{e}</p>
          ))}
        </div>
      )}

      {entries.length > 0 && errors.length === 0 && (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>RECIPIENTS</p>
            <p style={{ color: 'var(--text-1)', fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: '4px 0 0' }}>{entries.length}</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
            <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>TOTAL</p>
            <p style={{ color: 'var(--umbra-primary)', fontSize: 20, fontFamily: 'Space Mono, monospace', fontWeight: 700, margin: '4px 0 0' }}>{formatUsdc(totalUsdc)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
