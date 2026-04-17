'use client'

import { useEffect, useRef } from 'react'
import QR from 'qrcode'
import { cn } from '@/lib/utils/cn'

export function QRCode({
  value,
  size = 200,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QR.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: {
        dark: '#f5f5f5',
        light: '#1a1a1a',
      },
    }).catch(() => {
      /* ignore render errors */
    })
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={cn('rounded-md border border-border bg-bg-elevated', className)}
      aria-label="QR code"
    />
  )
}
