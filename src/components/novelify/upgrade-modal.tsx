'use client';

import { useState, useEffect } from 'react';
import { Crown, Lock, ArrowRight, X, Check, Loader2 } from 'lucide-react';
import { getPlanConfig, FEATURES, PLAN_TIERS, type PlanTier } from '@/lib/billing/plans';

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: string
  requiredPlan: string
  featureKey: string
  featureName?: string
  usage?: { used: number; limit: number | 'unlimited' }
}

function getUnlockableFeatures(currentPlan: string, targetPlan: string) {
  const currentIdx = PLAN_TIERS.indexOf(currentPlan as PlanTier)
  const targetIdx = PLAN_TIERS.indexOf(targetPlan as PlanTier)
  if (targetIdx <= currentIdx) return []

  return FEATURES.filter(f => {
    const requiredIdx = PLAN_TIERS.indexOf(f.planRequired as PlanTier)
    return requiredIdx > currentIdx && requiredIdx <= targetIdx
  })
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  requiredPlan,
  featureKey,
  featureName,
  usage,
}: UpgradeModalProps) {
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true))
      setError(null)
      const params = new URLSearchParams(window.location.search)
      const checkout = params.get('checkout')
      if (checkout === 'cancelled') {
        setCheckoutMessage('Checkout was cancelled. You can try again whenever you\'re ready.')
      } else if (checkout === 'success') {
        setCheckoutMessage('Payment successful! Your plan will be upgraded shortly.')
      } else {
        setCheckoutMessage(null)
      }
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentConfig = getPlanConfig(currentPlan)
  const targetConfig = getPlanConfig(requiredPlan)
  const matchedFeature = FEATURES.find(f => f.key === featureKey)
  const displayFeatureName = featureName || matchedFeature?.label || featureKey
  const isSamePlan = requiredPlan === currentPlan
  const unlockableFeatures = isSamePlan ? getUnlockableFeatures(currentPlan, PLAN_TIERS[PLAN_TIERS.indexOf(currentPlan as PlanTier) + 1] || requiredPlan) : getUnlockableFeatures(currentPlan, requiredPlan)
  const priceDiff = targetConfig[billingInterval === 'monthly' ? 'monthlyPrice' : 'yearlyPrice'] - currentConfig[billingInterval === 'monthly' ? 'monthlyPrice' : 'yearlyPrice']
  const usagePct = usage && usage.limit !== 'unlimited'
    ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
    : 0
  const yearlyMonthly = Math.round((targetConfig.yearlyPrice / 12) * 100) / 100
  const yearlySavings = targetConfig.monthlyPrice * 12 - targetConfig.yearlyPrice

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/billing/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: requiredPlan.toLowerCase(),
          interval: billingInterval,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'PAYMENT_NOT_CONFIGURED') {
          alert('Checkout is not configured yet.')
          return
        }
        setError(data.error || data.message || 'Something went wrong. Please try again.')
        return
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setError('Failed to connect. Please check your internet connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const displayPrice = billingInterval === 'monthly'
    ? `$${targetConfig.monthlyPrice}/mo`
    : `$${targetConfig.yearlyPrice}/yr`

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#121212',
          border: '1px solid rgba(201,169,110,0.30)',
          borderRadius: 20,
          padding: 32,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          opacity: visible ? 1 : 0,
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            color: '#8E8E93',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.10)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        >
          <X style={{ width: 16, height: 16 }} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'rgba(201,169,110,0.10)',
            border: '1px solid rgba(201,169,110,0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C9A96E',
            marginBottom: 20,
          }}
        >
          {isSamePlan ? (
            <Crown style={{ width: 22, height: 22 }} />
          ) : (
            <Lock style={{ width: 22, height: 22 }} />
          )}
        </div>

        {/* Heading */}
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 22,
            fontWeight: 600,
            color: '#F5F5F7',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: 0,
            marginBottom: 8,
          }}
        >
          {isSamePlan
            ? 'Upgrade for more capacity'
            : `Upgrade to ${targetConfig.name}`}
        </h2>

        <p style={{ fontSize: 13, color: '#8E8E93', lineHeight: 1.6, margin: 0, marginBottom: 24 }}>
          {isSamePlan
            ? `You've reached the limit for "${displayFeatureName}" on the ${currentConfig.name} plan. Upgrade to a higher tier for more capacity.`
            : `Upgrade from ${currentConfig.name} to ${targetConfig.name} to unlock ${displayFeatureName} and more.`}
        </p>

        {/* Checkout message banner */}
        {checkoutMessage && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 16,
              fontSize: 12,
              lineHeight: 1.5,
              background: checkoutMessage.includes('successful')
                ? 'rgba(52,211,153,0.10)'
                : 'rgba(245,158,11,0.10)',
              border: `1px solid ${checkoutMessage.includes('successful') ? 'rgba(52,211,153,0.20)' : 'rgba(245,158,11,0.20)'}`,
              color: checkoutMessage.includes('successful') ? '#34D399' : '#F59E0B',
            }}
          >
            {checkoutMessage}
          </div>
        )}

        {/* Billing interval toggle */}
        {targetConfig.yearlyPrice > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 0,
              background: '#0a0a0a',
              borderRadius: 10,
              padding: 3,
              marginBottom: 16,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              onClick={() => setBillingInterval('monthly')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: billingInterval === 'monthly' ? '#C9A96E' : 'transparent',
                color: billingInterval === 'monthly' ? '#1a0f00' : '#8E8E93',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              style={{
                flex: 1,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: billingInterval === 'yearly' ? '#C9A96E' : 'transparent',
                color: billingInterval === 'yearly' ? '#1a0f00' : '#8E8E93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              Yearly
              {yearlySavings > 0 && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#34D399',
                    background: 'rgba(52,211,153,0.15)',
                    padding: '1px 5px',
                    borderRadius: 4,
                    lineHeight: '16px',
                  }}
                >
                  Save ${yearlySavings}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Plan comparison */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            borderRadius: 14,
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Current
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#8E8E93' }}>
              {currentConfig.name}
            </div>
            <div style={{ fontSize: 13, color: '#8E8E93', marginTop: 2 }}>
              {billingInterval === 'monthly'
                ? `$${currentConfig.monthlyPrice}/mo`
                : `$${currentConfig.yearlyPrice}/yr`}
            </div>
          </div>

          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'rgba(201,169,110,0.10)',
            border: '1px solid rgba(201,169,110,0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <ArrowRight style={{ width: 16, height: 16, color: '#C9A96E' }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#C9A96E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Target
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#F5F5F7' }}>
              {targetConfig.name}
            </div>
            <div style={{ fontSize: 13, color: '#C9A96E', marginTop: 2 }}>
              {displayPrice}
              {priceDiff > 0 && (
                <span style={{ color: '#34D399', marginLeft: 6, fontSize: 11 }}>
                  +${priceDiff}/{billingInterval === 'monthly' ? 'mo' : 'yr'}
                </span>
              )}
            </div>
            {billingInterval === 'yearly' && yearlyMonthly < targetConfig.monthlyPrice && (
              <div style={{ fontSize: 10, color: '#34D399', marginTop: 1 }}>
                ${yearlyMonthly}/mo when billed yearly
              </div>
            )}
          </div>
        </div>

        {/* Usage meter */}
        {usage && usage.limit !== 'unlimited' && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginBottom: 8 }}>
              <span>You've used {usage.used} of {usage.limit} this month</span>
              <span>{usagePct}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 4,
                  background: usagePct >= 90
                    ? 'linear-gradient(90deg, #F87171, #EF4444)'
                    : 'linear-gradient(90deg, #C9A96E, #E8C98A)',
                  width: `${usagePct}%`,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Unlockable features */}
        {unlockableFeatures.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F5F7', marginBottom: 12 }}>
              What you'll unlock
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unlockableFeatures.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(201,169,110,0.05)',
                    border: '1px solid rgba(201,169,110,0.10)',
                  }}
                >
                  <Check style={{ width: 14, height: 14, color: '#34D399', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#F5F5F7' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 1 }}>
                      {f.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              marginBottom: 12,
              fontSize: 12,
              lineHeight: 1.5,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.20)',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        {/* CTA button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '13px 24px',
            borderRadius: 12,
            border: 'none',
            background: isLoading ? '#8E8E93' : '#C9A96E',
            color: '#1a0f00',
            fontSize: 14,
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s, transform 0.15s',
            marginBottom: 12,
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.background = '#E8C98A'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isLoading ? '#8E8E93' : '#C9A96E'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {isLoading ? (
            <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
          ) : (
            <Crown style={{ width: 16, height: 16 }} />
          )}
          {isLoading
            ? 'Creating checkout...'
            : `Upgrade to ${targetConfig.name} — ${displayPrice}`}
        </button>

        {/* Maybe later */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8E8E93',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F5F5F7' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8E8E93' }}
          >
            Maybe later
          </button>
        </div>

        <p style={{ fontSize: 10, color: '#5c5c5e', textAlign: 'center', margin: '8px 0 0' }}>
          No commitment. Cancel anytime.
        </p>

        {/* Inline style for spin animation */}
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
