'use client'

import { useState, DragEvent, ChangeEvent, useRef } from 'react'
import { RunSummaryTable } from './RunSummaryTable'
import { ExportReports } from './ExportReports'
import type { RunBundle } from './RunSummaryTable'

export function ViewingKeyDashboard() {
  const [mode, setMode] = useState<'upload' | 'manual'>('upload')
  const [bundle, setBundle] = useState<RunBundle | null>(null)
  const [dragging, setDragging] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [txSig, setTxSig] = useState('')
  const [viewingKey, setViewingKey] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function processFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as RunBundle
        if (!parsed.recipients || !Array.isArray(parsed.recipients)) {
          setParseError('Invalid bundle format — expected a ShieldPay run export.')
          return
        }
        setBundle(parsed)
        setParseError(null)
      } catch {
        setParseError('Could not parse file — must be valid JSON from a ShieldPay export.')
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

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    color: active ? 'var(--umbra-primary)' : 'var(--text-3)',
    fontFamily: 'Space Mono, monospace',
    fontSize: 11,
    fontWeight: 700 as const,
    cursor: 'pointer' as const,
    textTransform: 'uppercase' as const,
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--umbra-primary)' : '2px solid transparent',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Mode tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bd)' }}>
        <button style={tabStyle(mode === 'upload')} onClick={() => setMode('upload')}>Upload Run Bundle</button>
        <button style={tabStyle(mode === 'manual')} onClick={() => setMode('manual')}>Manual Verification</button>
      </div>

      {mode === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `1px dashed ${dragging ? 'var(--umbra-primary)' : 'var(--bd2)'}`,
              background: dragging ? 'var(--umbra-primary-bg)' : 'var(--surface)',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <p style={{ color: 'var(--text-2)', fontSize: 14, margin: 0 }}>
              Drop ShieldPay run bundle (.json) here or click to browse
            </p>
            <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={onFileChange} />
          </div>

          {parseError && (
            <p style={{ color: 'var(--error)', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>{parseError}</p>
          )}

          {bundle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>RUN ID</p>
                  <p style={{ color: 'var(--text-1)', fontSize: 13, fontFamily: 'Space Mono, monospace', margin: '4px 0 0' }}>{bundle.runId}</p>
                </div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>NETWORK</p>
                  <p style={{ color: 'var(--umbra-primary)', fontSize: 13, fontFamily: 'Space Mono, monospace', margin: '4px 0 0' }}>{bundle.network}</p>
                </div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--bd)', padding: '12px 20px' }}>
                  <p style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>VIEWING KEY</p>
                  <p style={{ color: 'var(--text-2)', fontSize: 11, fontFamily: 'Space Mono, monospace', margin: '4px 0 0', wordBreak: 'break-all' as const, maxWidth: 200 }}>
                    {bundle.monthlyViewingKey.slice(0, 16)}...
                  </p>
                </div>
              </div>
              <RunSummaryTable bundle={bundle} />
              <ExportReports bundle={bundle} />
            </div>
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: 'var(--text-2)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>TRANSACTION SIGNATURE</label>
            <input
              value={txSig}
              onChange={e => setTxSig(e.target.value)}
              placeholder="5xJ8..."
              style={{ background: 'var(--surface2)', border: '1px solid var(--bd2)', borderRadius: 0, padding: '10px 14px', color: 'var(--text-1)', fontFamily: 'Space Mono, monospace', fontSize: 12, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ color: 'var(--text-2)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>MONTHLY VIEWING KEY</label>
            <input
              value={viewingKey}
              onChange={e => setViewingKey(e.target.value)}
              placeholder="hex..."
              style={{ background: 'var(--surface2)', border: '1px solid var(--bd2)', borderRadius: 0, padding: '10px 14px', color: 'var(--text-1)', fontFamily: 'Space Mono, monospace', fontSize: 12, outline: 'none' }}
            />
          </div>
          {txSig && viewingKey && (
            <div style={{ background: 'var(--umbra-primary-bg)', border: '1px solid var(--umbra-primary-bd)', padding: '16px' }}>
              <p style={{ color: 'var(--umbra-primary)', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: '0 0 8px', fontWeight: 700 }}>
                VERIFICATION INSTRUCTIONS
              </p>
              <p style={{ color: 'var(--text-2)', fontSize: 12, margin: '0 0 8px' }}>
                Use the Umbra compliance tools at sdk.umbraprivacy.com/sdk/compliance to verify this transaction with the viewing key.
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono, monospace', margin: 0 }}>
                Program ID (devnet): DSuKkyqGVGgo4QtPABfxKJKygUDACbUhirnuv63mEpAJ
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
