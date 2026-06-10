'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, X, Star, Zap, Crown, Sparkles } from 'lucide-react';
import { PLANS, FEATURES, hasFeature, type PlanTier } from '@/lib/billing/plans';

const GROUP_LABELS: Record<string, string> = {
  writing: 'Writing',
  ai: 'AI & Revision',
  export: 'Export',
  publishing: 'Publishing',
  team: 'Team',
  marketing: 'Marketing',
  support: 'Support',
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Star size={20} />,
  starter: <Zap size={20} />,
  pro: <Crown size={20} />,
  studio: <Sparkles size={20} />,
};

const TIERS: PlanTier[] = ['free', 'starter', 'pro', 'studio'];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const { data: session } = useSession();
  const userPlan: PlanTier = (session?.user as any)?.plan ?? 'free';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#F5F5F7',
        fontFamily: "'Geist', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 48,
              fontWeight: 700,
              color: '#C9A96E',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            Pricing
          </h1>
          <p
            style={{
              fontSize: 18,
              color: '#F5F5F7',
              opacity: 0.6,
              margin: 0,
            }}
          >
            Choose the plan that fits your writing journey
          </p>
        </div>

        {/* Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 56,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: yearly ? '#F5F5F780' : '#F5F5F7',
              transition: 'color 0.2s',
            }}
          >
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            style={{
              position: 'relative',
              width: 52,
              height: 28,
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: yearly ? '#C9A96E' : '#2a2a2a',
              transition: 'background 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 3,
                left: yearly ? 27 : 3,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: '#080808',
                transition: 'left 0.2s',
              }}
            />
          </button>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: yearly ? '#F5F5F7' : '#F5F5F780',
              transition: 'color 0.2s',
            }}
          >
            Yearly
          </span>
          {yearly && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#080808',
                background: '#C9A96E',
                padding: '2px 10px',
                borderRadius: 999,
                letterSpacing: '0.02em',
              }}
            >
              Save 15%
            </span>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ marginBottom: 80 }}>
          {TIERS.map((tier) => {
            const plan = PLANS[tier];
            const price = yearly ? plan.yearlyPrice / 12 : plan.monthlyPrice;
            const isCurrent = userPlan === tier;
            const IconComponent = PLAN_ICONS[tier];

            return (
              <div
                key={tier}
                style={{
                  position: 'relative',
                  background: '#121212',
                  border: `1px solid rgba(201, 169, 110, ${plan.highlighted ? 0.6 : 0.3})`,
                  borderRadius: 16,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  ...(plan.highlighted
                    ? {
                        boxShadow: '0 0 30px rgba(201, 169, 110, 0.15)',
                        borderColor: '#C9A96E',
                      }
                    : {}),
                }}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#C9A96E',
                      color: '#080808',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 14px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Icon + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ color: '#C9A96E' }}>{IconComponent}</div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#F5F5F7',
                      margin: 0,
                    }}
                  >
                    {plan.name}
                  </h3>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: '#F5F5F780',
                    margin: '0 0 20px',
                    lineHeight: 1.5,
                  }}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{ marginBottom: 24 }}>
                  <span
                    style={{
                      fontSize: 42,
                      fontWeight: 700,
                      color: '#F5F5F7',
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    ${price}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: '#F5F5F780',
                      marginLeft: 6,
                    }}
                  >
                    /month
                  </span>
                </div>

                {/* Features */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    marginBottom: 28,
                  }}
                >
                  {FEATURES.filter((f) => f.planRequired === 'free').map((f) => (
                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#F5F5F7B3' }}>{f.label}</span>
                    </div>
                  ))}
                  {FEATURES.filter((f) => f.planRequired === tier && tier !== 'free').map((f) => (
                    <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#F5F5F7B3' }}>{f.label}</span>
                    </div>
                  ))}
                  {FEATURES.filter(
                    (f) => hasFeature(tier, f.key) === false && f.planRequired !== 'free'
                  ).length > 0 && (
                    <div
                      style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: 12,
                        marginTop: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: '#F5F5F750', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                        Everything in {tier === 'free' ? '' : TIERS[TIERS.indexOf(tier) - 1] ? PLANS[TIERS[TIERS.indexOf(tier) - 1]].name + ' plus' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {isCurrent ? (
                  <div
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      textAlign: 'center',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      border: '1px solid rgba(201, 169, 110, 0.4)',
                      color: '#C9A96E',
                      background: 'transparent',
                    }}
                  >
                    Current Plan
                  </div>
                ) : (
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 0',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 600,
                      border: plan.highlighted ? 'none' : '1px solid rgba(201, 169, 110, 0.4)',
                      color: plan.highlighted ? '#080808' : '#C9A96E',
                      background: plan.highlighted ? '#C9A96E' : 'transparent',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {tier === 'pro' ? 'Get Started' : tier === 'free' ? 'Start Free' : `Choose ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div
          style={{
            border: '1px solid rgba(201, 169, 110, 0.15)',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 80,
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr
                  style={{
                    position: 'sticky' as any,
                    top: 0,
                    background: '#0d0d0d',
                    zIndex: 10,
                  }}
                >
                  <th
                    style={{
                      textAlign: 'left',
                      padding: '18px 24px',
                      fontWeight: 600,
                      color: '#F5F5F7',
                      fontSize: 13,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase' as const,
                      borderBottom: '1px solid rgba(201, 169, 110, 0.15)',
                      minWidth: 220,
                    }}
                  >
                    Feature
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier}
                      style={{
                        textAlign: 'center',
                        padding: '18px 16px',
                        fontWeight: 600,
                        color: tier === 'pro' ? '#C9A96E' : '#F5F5F7',
                        fontSize: 13,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase' as const,
                        borderBottom: '1px solid rgba(201, 169, 110, 0.15)',
                        minWidth: 100,
                      }}
                    >
                      {PLANS[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(GROUP_LABELS).map(([groupKey, groupLabel]) => {
                  const groupFeatures = FEATURES.filter((f) => f.group === groupKey);
                  if (groupFeatures.length === 0) return null;

                  return (
                    <>
                      {/* Group header */}
                      <tr
                        key={`group-${groupKey}`}
                        style={{
                          background: 'rgba(201, 169, 110, 0.06)',
                        }}
                      >
                        <td
                          colSpan={5}
                          style={{
                            padding: '14px 24px',
                            fontWeight: 600,
                            color: '#C9A96E',
                            fontSize: 13,
                            letterSpacing: '0.02em',
                          }}
                        >
                          {groupLabel}
                        </td>
                      </tr>

                      {/* Feature rows */}
                      {groupFeatures.map((feature, idx) => {
                        const bgColor =
                          idx % 2 === 0
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'transparent';

                        return (
                          <tr
                            key={feature.key}
                            style={{ background: bgColor }}
                          >
                            <td
                              style={{
                                padding: '14px 24px',
                                color: '#F5F5F7CC',
                                fontSize: 13,
                                borderBottom: '1px solid rgba(255,255,255,0.04)',
                              }}
                            >
                              {feature.label}
                            </td>
                            {TIERS.map((tier) => {
                              const available = hasFeature(tier, feature.key);
                              return (
                                <td
                                  key={`${feature.key}-${tier}`}
                                  style={{
                                    textAlign: 'center',
                                    padding: '14px 16px',
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                  }}
                                >
                                  {available ? (
                                    <Check
                                      size={18}
                                      style={{
                                        color: '#10B981',
                                        display: 'inline-block',
                                      }}
                                    />
                                  ) : (
                                    <X
                                      size={18}
                                      style={{
                                        color: '#F5F5F740',
                                        display: 'inline-block',
                                      }}
                                    />
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
              color: '#C9A96E',
              textAlign: 'center',
              margin: '0 0 40px',
            }}
          >
            Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: 'Can I upgrade or downgrade anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, changes apply at the start of your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'We offer a free plan with limited features that never expires. You can use it to try out Novelify before committing to a paid plan. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'Online payment is not yet available in our current development build. We are working on integrating secure payment processing and will announce supported methods upon release.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue through the end of your current billing period, and you will not be charged again.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                style={{
                  background: '#121212',
                  border: '1px solid rgba(201, 169, 110, 0.15)',
                  borderRadius: 12,
                  padding: '20px 24px',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#F5F5F7',
                    margin: '0 0 8px',
                  }}
                >
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#F5F5F780',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
