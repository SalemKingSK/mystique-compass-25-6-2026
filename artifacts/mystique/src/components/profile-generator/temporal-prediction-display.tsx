/**
 * MYSTIQUE COMPASS — Temporal Prediction Display
 * Integrates the 14-Layer Temporal Prediction Engine v2
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  generateTemporalPrediction,
  generateMonthlyBreakdown,
  generateMultiYearForecast,
  type TemporalPredictionV2,
  type DailyForecast,
} from '@/lib/temporal-prediction-engine-v2';

// ─── helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d4af37', fontWeight: 700 }}>{title}</span>
      </div>
      {subtitle && <p style={{ fontSize: '0.65rem', color: 'rgba(210,195,250,0.5)', fontFamily: "'Cormorant Garamond',serif", letterSpacing: '0.05em', paddingLeft: '1.6rem', margin: 0 }}>{subtitle}</p>}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(212,175,55,0.12)',
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '0.75rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: '0.55rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.6rem', color: 'rgba(210,195,250,0.65)', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '0.6rem', color, fontWeight: 700, fontFamily: "'Cinzel',serif" }}>{value}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function PillBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.5rem',
      fontFamily: "'Cinzel',serif",
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '2px 8px',
      borderRadius: 999,
      background: `${color}22`,
      color,
      border: `1px solid ${color}44`,
      marginRight: '0.3rem',
      marginBottom: '0.25rem',
    }}>
      {children}
    </span>
  );
}

// ─── Today Card ───────────────────────────────────────────────────────────────
function TodayCard({ today }: { today: DailyForecast }) {
  const bgColor = today.isPowerWindow
    ? 'rgba(52,211,153,0.08)'
    : today.avoidMajorDecisions
    ? 'rgba(239,68,68,0.07)'
    : 'rgba(167,139,250,0.06)';
  const borderColor = today.isPowerWindow
    ? 'rgba(52,211,153,0.22)'
    : today.avoidMajorDecisions
    ? 'rgba(239,68,68,0.2)'
    : 'rgba(167,139,250,0.15)';

  return (
    <Card style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.58rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.7)' }}>
            Today · {today.dayOfWeek}
          </p>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(210,195,250,0.5)' }}>{today.date}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.4rem', fontFamily: "'Cinzel',serif", color: '#d4af37', fontWeight: 700, lineHeight: 1 }}>
            {today.personalDay}
          </div>
          <div style={{ fontSize: '0.48rem', color: 'rgba(212,175,55,0.5)', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>Personal Day</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.6rem' }}>
        {today.isPowerWindow && <PillBadge color="#34d399">⚡ Power Window</PillBadge>}
        {today.isLuckyDay && <PillBadge color="#a78bfa">✦ Lucky Day</PillBadge>}
        {today.isLuckyDate && <PillBadge color="#60a5fa">◈ Lucky Date</PillBadge>}
        {today.avoidMajorDecisions && <PillBadge color="#f87171">⚠ Tread Softly</PillBadge>}
      </div>
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(210,195,250,0.78)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65, fontStyle: 'italic' }}>
        {today.shortNarrative}
      </p>
      {today.focus && (
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.6rem', color: '#d4af37', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em' }}>
          Focus: {today.focus}
        </p>
      )}
    </Card>
  );
}

// ─── Three-Year Arc ───────────────────────────────────────────────────────────
function ThreeYearArc({ arc }: { arc: TemporalPredictionV2['threeYearArc'] }) {
  const years = [
    { label: 'Last Year', data: { py: arc.thisYear.py - 1 < 1 ? 9 : arc.thisYear.py - 1, title: '', one_line: '' }, dimmed: true },
    { label: 'This Year', data: arc.thisYear, dimmed: false, highlight: true },
    { label: 'Next Year', data: arc.nextYear, dimmed: false },
    { label: 'Year After', data: arc.yearAfter, dimmed: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
      {years.map((y) => (
        <div key={y.label} style={{
          textAlign: 'center',
          padding: '0.55rem 0.3rem',
          borderRadius: '0.6rem',
          background: y.highlight ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)',
          border: y.highlight ? '1px solid rgba(212,175,55,0.28)' : '1px solid rgba(255,255,255,0.05)',
          opacity: y.dimmed ? 0.45 : 1,
        }}>
          <div style={{ fontSize: '1.2rem', fontFamily: "'Cinzel',serif", color: y.highlight ? '#d4af37' : 'rgba(210,195,250,0.7)', fontWeight: 700, lineHeight: 1 }}>{y.data.py}</div>
          <div style={{ fontSize: '0.42rem', color: 'rgba(212,175,55,0.6)', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0.2rem 0' }}>{y.label}</div>
          {y.data.title && <div style={{ fontSize: '0.48rem', color: 'rgba(210,195,250,0.55)', lineHeight: 1.3 }}>{y.data.title}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Monthly Breakdown ────────────────────────────────────────────────────────
function MonthlyGrid({ birthDay, birthMonth, birthYear }: { birthDay: number; birthMonth: number; birthYear: number }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const months = generateMonthlyBreakdown(birthDay, birthMonth, birthYear, currentYear);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem' }}>
      {months.map((m) => {
        const isCurrent = m.month === currentMonth;
        const isPast = m.month < currentMonth;
        return (
          <div key={m.month} style={{
            padding: '0.4rem 0.3rem',
            borderRadius: '0.5rem',
            background: isCurrent ? 'rgba(212,175,55,0.12)' : m.isOpportunityWindow ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.02)',
            border: isCurrent ? '1px solid rgba(212,175,55,0.3)' : m.isOpportunityWindow ? '1px solid rgba(52,211,153,0.18)' : '1px solid rgba(255,255,255,0.05)',
            opacity: isPast ? 0.4 : 1,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.42rem', color: isCurrent ? '#d4af37' : 'rgba(210,195,250,0.5)', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.15rem' }}>{monthNames[m.month - 1]}</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: isCurrent ? '#d4af37' : m.isOpportunityWindow ? '#34d399' : 'rgba(210,195,250,0.7)', lineHeight: 1 }}>{m.personalMonth}</div>
            {m.isOpportunityWindow && <div style={{ fontSize: '0.38rem', color: '#34d399', marginTop: '0.1rem' }}>✦ window</div>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Domain Cards ─────────────────────────────────────────────────────────────
function DomainCards({ domains }: { domains: TemporalPredictionV2['domains'] }) {
  const entries = [
    { icon: '💼', label: 'Career', text: domains.career },
    { icon: '💑', label: 'Relationships', text: domains.relationships },
    { icon: '💰', label: 'Finances', text: domains.finances },
    { icon: '🌿', label: 'Health', text: domains.health },
    { icon: '🔮', label: 'Spirituality', text: domains.spirituality },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {entries.map(e => (
        <div key={e.label} style={{
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
          padding: '0.65rem 0.75rem',
          borderRadius: '0.6rem',
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.3 }}>{e.icon}</span>
          <div>
            <p style={{ margin: '0 0 0.2rem', fontSize: '0.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.65)', fontWeight: 700 }}>{e.label}</p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.78)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{e.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tension Signature ────────────────────────────────────────────────────────
function TensionSignature({ sig }: { sig: TemporalPredictionV2['tensionSignature'] }) {
  const color = sig.nature === 'amplifying' ? '#34d399' : sig.nature === 'friction' ? '#f87171' : '#a78bfa';
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <PillBadge color={color}>{sig.forceA}</PillBadge>
        <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>⟷</span>
        <PillBadge color={color}>{sig.forceB}</PillBadge>
        <PillBadge color={color}>{sig.nature}</PillBadge>
      </div>
      <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65, fontStyle: 'italic' }}>{sig.interpretation}</p>
    </Card>
  );
}

// ─── Contradictions ───────────────────────────────────────────────────────────
function ContradictionList({ contradictions }: { contradictions: TemporalPredictionV2['contradictions'] }) {
  if (!contradictions.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {contradictions.map((c, i) => (
        <div key={i} style={{ padding: '0.65rem 0.75rem', borderRadius: '0.6rem', background: 'rgba(251,146,60,0.05)', border: '1px solid rgba(251,146,60,0.14)' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.58rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fb923c' }}>
            {c.signal1} · {c.signal2}
          </p>
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.65rem', color: 'rgba(210,195,250,0.7)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.55 }}>{c.tension}</p>
          <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(52,211,153,0.8)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.55 }}>→ {c.resolution}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Lo Shu Activation ────────────────────────────────────────────────────────
function LoShuActivationCard({ lsa }: { lsa: TemporalPredictionV2['loShuActivation'] }) {
  return (
    <Card>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem' }}>
        {lsa.activatedNumbers.map(n => (
          <span key={n} style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(167,139,250,0.15)',
            border: '1px solid rgba(167,139,250,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: '#a78bfa',
          }}>{n}</span>
        ))}
      </div>
      <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{lsa.gridNarrative}</p>
      {lsa.strengthenedArrows.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.52rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#34d399' }}>Strengthened</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>{lsa.strengthenedArrows.map(a => <PillBadge key={a} color="#34d399">{a}</PillBadge>)}</div>
        </div>
      )}
      {lsa.weakenedArrows.length > 0 && (
        <div style={{ marginTop: '0.4rem' }}>
          <p style={{ margin: '0 0 0.25rem', fontSize: '0.52rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f87171' }}>Under Pressure</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>{lsa.weakenedArrows.map(a => <PillBadge key={a} color="#f87171">{a}</PillBadge>)}</div>
        </div>
      )}
    </Card>
  );
}

// ─── Multi-Year Forecast mini-chart ──────────────────────────────────────────
function MultiYearChart({ birthDay, birthMonth, birthYear }: { birthDay: number; birthMonth: number; birthYear: number }) {
  const currentYear = new Date().getFullYear();
  const data = generateMultiYearForecast(birthDay, birthMonth, birthYear, currentYear - 1, 7);
  return (
    <div>
      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-end', height: 60, marginBottom: '0.4rem' }}>
        {data.map((d) => {
          const height = Math.max(20, (d.scores.overallYear / 100) * 56);
          const isNow = d.year === currentYear;
          return (
            <div key={d.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: (d.year - currentYear + 1) * 0.07 }}
                style={{
                  width: '100%', borderRadius: '3px 3px 0 0',
                  background: isNow
                    ? 'linear-gradient(180deg, #d4af37 0%, #a07820 100%)'
                    : d.year < currentYear
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(167,139,250,0.3)',
                  border: isNow ? '1px solid rgba(212,175,55,0.5)' : 'none',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '0.42rem', fontFamily: "'Cinzel',serif", color: isNow ? '#d4af37' : 'rgba(210,195,250,0.4)', textAlign: 'center', lineHeight: 1 }}>
                PY{d.py}
                <br />{d.year}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.25rem' }}>
        {data.map((d) => (
          <div key={d.year} style={{ flex: 1, fontSize: '0.38rem', color: d.year === currentYear ? '#d4af37' : 'rgba(210,195,250,0.3)', textAlign: 'center', lineHeight: 1.3 }}>
            {Math.round(d.scores.overallYear)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cheiro Day Intelligence ──────────────────────────────────────────────────
function CheiroDayCard({ cheiro }: { cheiro: TemporalPredictionV2['cheiroDayIntelligence'] }) {
  return (
    <Card>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.6rem' }}>
        <div>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.5rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)' }}>Lucky Days</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
            {cheiro.luckyDaysOfWeek.map(d => <PillBadge key={d} color="#a78bfa">{d}</PillBadge>)}
          </div>
        </div>
        <div>
          <p style={{ margin: '0 0 0.3rem', fontSize: '0.5rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(212,175,55,0.6)' }}>Lucky Dates</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
            {cheiro.luckyDatesThisMonth.slice(0, 6).map(d => <PillBadge key={d} color="#60a5fa">{d}</PillBadge>)}
          </div>
        </div>
      </div>
      {cheiro.nextPowerWindow && (
        <div style={{ padding: '0.45rem 0.6rem', borderRadius: '0.5rem', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.18)', marginBottom: '0.45rem' }}>
          <p style={{ margin: 0, fontSize: '0.58rem', color: '#34d399', fontFamily: "'Cinzel',serif", letterSpacing: '0.05em' }}>⚡ Next Power Window: {cheiro.nextPowerWindow}</p>
        </div>
      )}
      {cheiro.strongPeriod && (
        <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(212,175,55,0.65)', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic' }}>{cheiro.strongPeriod}</p>
      )}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface TemporalPredictionDisplayProps {
  birthDay: number;
  birthMonth: number;
  birthYear: number;
}

export function TemporalPredictionDisplay({ birthDay, birthMonth, birthYear }: TemporalPredictionDisplayProps) {
  const prediction = React.useMemo(
    () => generateTemporalPrediction(birthDay, birthMonth, birthYear),
    [birthDay, birthMonth, birthYear]
  );

  const { meta, headline, domains, probabilityScores, cheiroDayIntelligence, loShuActivation,
          missingNumberForecast, repeatedNumberAmplifier, karmicTrigger, pinnacleTransitionRadar,
          contradictions, tensionSignature, windowOfOpportunity, cautionFlag, threeYearArc,
          isClimatericYear, climatericNote, todayForecast } = prediction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '2rem' }}
    >
      {/* ── Meta Row ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        {[
          { label: 'Life Path', value: meta.lifePath },
          { label: 'Psychic', value: meta.psychicNumber },
          { label: 'Personal Year', value: meta.personalYear },
          { label: 'Personal Month', value: meta.personalMonth },
        ].map(m => (
          <div key={m.label} style={{
            flex: '1 1 calc(25% - 0.4rem)', minWidth: 60,
            textAlign: 'center',
            padding: '0.5rem 0.3rem',
            borderRadius: '0.6rem',
            background: 'rgba(212,175,55,0.07)',
            border: '1px solid rgba(212,175,55,0.15)',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: '#d4af37', lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '0.42rem', color: 'rgba(212,175,55,0.55)', fontFamily: "'Cinzel',serif", letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── Climacteric Alert ─────────────────────────────────────── */}
      {isClimatericYear && climatericNote && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: '0.7rem 0.9rem',
            borderRadius: '0.7rem',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.35)',
            marginBottom: '0.9rem',
          }}
        >
          <p style={{ margin: '0 0 0.2rem', fontSize: '0.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.15em', textTransform: 'uppercase', color: '#d4af37' }}>⭐ Climacteric Year</p>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.85)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{climatericNote}</p>
        </motion.div>
      )}

      {/* ── Headline ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.1rem', padding: '0.85rem 0.9rem', borderRadius: '0.75rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(210,195,250,0.9)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.7, fontStyle: 'italic' }}>{headline}</p>
      </div>

      {/* ── Today ─────────────────────────────────────────────────── */}
      <SectionTitle icon="☀️" title="Today's Intelligence" subtitle={`Personal Day ${todayForecast.personalDay} · Universal Day ${todayForecast.universalDay}`} />
      <TodayCard today={todayForecast} />

      {/* ── Three-Year Arc ────────────────────────────────────────── */}
      <SectionTitle icon="🔭" title="3-Year Arc" subtitle={threeYearArc.arcSummary} />
      <ThreeYearArc arc={threeYearArc} />

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ margin: '0.75rem 0 0.3rem', fontSize: '0.6rem', color: 'rgba(210,195,250,0.65)', fontFamily: "'Cormorant Garamond',serif', lineHeight: 1.65 }}>
          {threeYearArc.thisYear.one_line}
        </p>
      </div>

      {/* ── Probability Scores ────────────────────────────────────── */}
      <SectionTitle icon="📊" title="Probability Scores" subtitle="5-domain confidence index for this year" />
      <Card>
        <ScoreBar label="Career Momentum"        value={probabilityScores.careerMomentum}        color="#60a5fa" />
        <ScoreBar label="Financial Growth"        value={probabilityScores.financialGrowth}        color="#34d399" />
        <ScoreBar label="Relationship Stability" value={probabilityScores.relationshipStability}  color="#f472b6" />
        <ScoreBar label="Health Discipline"      value={probabilityScores.healthDiscipline}       color="#4ade80" />
        <ScoreBar label="Spiritual Growth"       value={probabilityScores.spiritualGrowth}        color="#a78bfa" />
        <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <ScoreBar label="Overall Year"         value={probabilityScores.overallYear}            color="#d4af37" />
        </div>
      </Card>

      {/* ── Domain Forecasts ─────────────────────────────────────── */}
      <SectionTitle icon="🌐" title="Life Domain Forecasts" subtitle={`Personal Year ${meta.personalYear} · ${new Date().getFullYear()}`} />
      <DomainCards domains={domains} />

      {/* ── Monthly Breakdown ─────────────────────────────────────── */}
      <SectionTitle icon="📅" title={`Monthly Rhythm · ${new Date().getFullYear()}`} subtitle="Personal Month by month with opportunity windows" />
      <Card><MonthlyGrid birthDay={birthDay} birthMonth={birthMonth} birthYear={birthYear} /></Card>

      {/* ── Window of Opportunity ─────────────────────────────────── */}
      <Card style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.18)' }}>
        <p style={{ margin: '0 0 0.3rem', fontSize: '0.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#34d399' }}>✦ Window of Opportunity</p>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(210,195,250,0.9)', fontFamily: "'Cinzel',serif" }}>{windowOfOpportunity.monthRange}</p>
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(210,195,250,0.7)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{windowOfOpportunity.reason}</p>
      </Card>

      {/* ── Caution Flag ─────────────────────────────────────────── */}
      <Card style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <p style={{ margin: '0 0 0.3rem', fontSize: '0.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f87171' }}>⚠ Caution Flag</p>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.68rem', color: 'rgba(210,195,250,0.85)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.6 }}>{cautionFlag.risk}</p>
        <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(52,211,153,0.8)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.6 }}>Mitigation: {cautionFlag.mitigation}</p>
      </Card>

      {/* ── Tension Signature ────────────────────────────────────── */}
      <SectionTitle icon="⚡" title="Tension Signature" subtitle="Dominant force-pair and their cosmic interplay" />
      <TensionSignature sig={tensionSignature} />

      {/* ── Cheiro Day Intelligence ──────────────────────────────── */}
      <SectionTitle icon="🔯" title="Cheiro Day Intelligence" subtitle="Lucky days, dates & power windows" />
      <CheiroDayCard cheiro={cheiroDayIntelligence} />

      {/* ── Lo Shu Grid Activation ──────────────────────────────── */}
      <SectionTitle icon="☯️" title="Lo Shu Grid Activation" subtitle="Grid resonance for this personal year" />
      <LoShuActivationCard lsa={loShuActivation} />

      {/* ── Missing Numbers ──────────────────────────────────────── */}
      {missingNumberForecast.missingNumbers.length > 0 && (
        <>
          <SectionTitle icon="🕳" title="Missing Numbers Forecast" />
          <Card>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
              {missingNumberForecast.missingNumbers.map(n => (
                <span key={n} style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: missingNumberForecast.activatedMissing.includes(n) ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${missingNumberForecast.activatedMissing.includes(n) ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Cinzel',serif",
                  color: missingNumberForecast.activatedMissing.includes(n) ? '#34d399' : '#f87171',
                }}>{n}</span>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{missingNumberForecast.narrative}</p>
          </Card>
        </>
      )}

      {/* ── Repeated Numbers ─────────────────────────────────────── */}
      {repeatedNumberAmplifier.dominantNumber !== null && (
        <>
          <SectionTitle icon="🔁" title="Repeated Number Amplifier" />
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(167,139,250,0.15)', border: '2px solid rgba(167,139,250,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: '#a78bfa',
              }}>{repeatedNumberAmplifier.dominantNumber}</span>
              <span style={{ fontSize: '0.62rem', color: 'rgba(167,139,250,0.75)', fontFamily: "'Cinzel',serif" }}>
                Appears {repeatedNumberAmplifier.dominantCount}×
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{repeatedNumberAmplifier.amplificationNote}</p>
          </Card>
        </>
      )}

      {/* ── Karmic Debt ──────────────────────────────────────────── */}
      {karmicTrigger.debtNumber && (
        <>
          <SectionTitle icon="♾️" title="Karmic Debt Trigger" />
          <Card style={{ background: karmicTrigger.isTriggered ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${karmicTrigger.isTriggered ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <PillBadge color={karmicTrigger.isTriggered ? '#f87171' : '#a78bfa'}>Karmic Debt {karmicTrigger.debtNumber}</PillBadge>
              {karmicTrigger.isTriggered && <PillBadge color="#f87171">Active</PillBadge>}
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{karmicTrigger.triggerExplanation}</p>
          </Card>
        </>
      )}

      {/* ── Pinnacle Transition Radar ────────────────────────────── */}
      {pinnacleTransitionRadar.isInTransitionWindow && (
        <>
          <SectionTitle icon="🗼" title="Pinnacle Transition Radar" />
          <Card style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.18)' }}>
            <p style={{ margin: '0 0 0.3rem', fontSize: '0.55rem', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: '#fb923c' }}>
              ⚡ {pinnacleTransitionRadar.monthsUntilTransition !== null
                ? `${pinnacleTransitionRadar.monthsUntilTransition} months to transition`
                : 'Transition window active'}
            </p>
            <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(210,195,250,0.75)', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.65 }}>{pinnacleTransitionRadar.transitionNarrative}</p>
          </Card>
        </>
      )}

      {/* ── Contradiction Engine ─────────────────────────────────── */}
      {contradictions.length > 0 && (
        <>
          <SectionTitle icon="⚖️" title="Contradiction Engine" subtitle="Conflicting signals & resolution paths" />
          <ContradictionList contradictions={contradictions} />
        </>
      )}

      {/* ── Active Pinnacle & Challenge ──────────────────────────── */}
      <SectionTitle icon="🏔" title="Pinnacle & Challenge" subtitle={`Stage ${meta.activePinnacleStage} · Ages ${meta.activePinnacleAgeRange}`} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Card style={{ textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: '#d4af37', lineHeight: 1 }}>{meta.activePinnacleNumber}</div>
          <div style={{ fontSize: '0.48rem', color: 'rgba(212,175,55,0.55)', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.3rem' }}>Active Pinnacle</div>
        </Card>
        <Card style={{ textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Cinzel',serif", color: '#f87171', lineHeight: 1 }}>{meta.activeChallenge}</div>
          <div style={{ fontSize: '0.48rem', color: 'rgba(248,113,113,0.55)', fontFamily: "'Cinzel',serif", letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '0.3rem' }}>Active Challenge</div>
        </Card>
      </div>

      {/* ── Multi-Year Score Chart ────────────────────────────────── */}
      <SectionTitle icon="📈" title="7-Year Overview" subtitle="Overall year score across your near horizon" />
      <Card><MultiYearChart birthDay={birthDay} birthMonth={birthMonth} birthYear={birthYear} /></Card>
    </motion.div>
  );
}
