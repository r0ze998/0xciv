interface IconProps {
  size?: number
  color?: string
  className?: string
}

// === Resource Icons ===

export function FoodIcon({ size = 16, color = '#4ade80', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8v3h8v-3c3-1.5 5-4.5 5-8 0-5-4-9-9-9z" fill={color} opacity="0.15" />
      <path d="M12 2C7 2 3 6 3 11c0 3.5 2 6.5 5 8v3h8v-3c3-1.5 5-4.5 5-8 0-5-4-9-9-9z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6v5M9.5 8.5h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function MetalIcon({ size = 16, color = '#60a5fa', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 3l6 8 6-8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13h16l-2 8H6l-2-8z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 13v4M12 13v5M16 13v4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function KnowledgeIcon({ size = 16, color = '#c084fc', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L2 8l10 5 10-5-10-5z" fill={color} opacity="0.15" />
      <path d="M12 3L2 8l10 5 10-5-10-5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 10v6l8 4 8-4v-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8v8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="17" r="1" fill={color} />
    </svg>
  )
}

// === Event Icons ===

export function SwordIcon({ size = 16, color = '#f87171', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 2l-8 8M14 6l4 4M3 21l4-4M7 17l3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 14l-3 3 4 4 3-3-4-4z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function ShieldIcon({ size = 16, color = '#60a5fa', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3L4 7v5c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V7l-8-4z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HandshakeIcon({ size = 16, color = '#fbbf24', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M2 11l4-4 3 1 3-3 4 1 4-3 2 2-5 5-3-1-3 3-3-1-4 4-2-2z" fill={color} opacity="0.15" />
      <path d="M2 11l4-4 3 1 3-3 4 1 4-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 15l6 5 6-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SkullIcon({ size = 16, color = '#f87171', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2C8 2 5 5.5 5 9.5c0 2.5 1 4.5 2.5 6V19h9v-3.5C18 14 19 12 19 9.5 19 5.5 16 2 12 2z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <circle cx="9" cy="10" r="1.5" fill={color} />
      <circle cx="15" cy="10" r="1.5" fill={color} />
      <path d="M10 19v3M14 19v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function SignalIcon({ size = 16, color = '#00ff41', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0" fill={color} />
      <path d="M7.5 7.5a6.5 6.5 0 0 1 9 0M5 5a10.5 10.5 0 0 1 14 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16.5 16.5a6.5 6.5 0 0 1-9 0M19 19a10.5 10.5 0 0 1-14 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// === Tech Icons ===

export function SeedlingIcon({ size = 16, color = '#4ade80', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 22V12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 12c0-4 2-7 5-9 3 2 5 5 5 9" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 17c3-2 5.5-3 8-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function AnvilIcon({ size = 16, color = '#60a5fa', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 12h16v3H4z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <path d="M6 15v5M18 15v5M8 12V8h8v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 8V5h4v3" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export function ScrollIcon({ size = 16, color = '#fbbf24', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 3h10a2 2 0 0 1 2 2v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" fill={color} opacity="0.1" stroke={color} strokeWidth="1.5" />
      <path d="M9 8h6M9 12h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function BrainIcon({ size = 16, color = '#c084fc', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 4C9 4 7 6 7 8.5c0 1.5.5 2.5 1.5 3.5L12 16l3.5-4C16.5 11 17 10 17 8.5 17 6 15 4 12 4z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 16v5M8 19h8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="8" r="1" fill={color} />
      <circle cx="14" cy="8" r="1" fill={color} />
    </svg>
  )
}

export function GearIcon({ size = 16, color = '#fb923c', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function StarIcon({ size = 16, color = '#fbbf24', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l3 6.5L22 10l-5 4.5L18.5 22 12 18.5 5.5 22 7 14.5 2 10l7-1.5L12 2z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// === Victory Icons ===

export function CrownIcon({ size = 16, color = '#fbbf24', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 18h18L19 8l-4 4-3-6-3 6-4-4-2 10z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M3 18h18v3H3z" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

export function FlaskIcon({ size = 16, color = '#a855f7', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9 3h6v5l4 10H5l4-10V3z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 3h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 15h10" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <circle cx="10" cy="17" r="1" fill={color} opacity="0.5" />
      <circle cx="14" cy="16" r="0.8" fill={color} opacity="0.5" />
    </svg>
  )
}

export function CoinsIcon({ size = 16, color = '#eab308', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="10" cy="10" rx="7" ry="3" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <path d="M3 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" stroke={color} strokeWidth="1.5" />
      <path d="M17 12c2 .5 4 1.5 4 3v4c0 1.7-3.1 3-7 3s-7-1.3-7-3v-1" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// === Utility: Lookup maps for replacing emoji references ===

export const RESOURCE_ICON_MAP = {
  food: FoodIcon,
  metal: MetalIcon,
  knowledge: KnowledgeIcon,
} as const

export const EVENT_ICON_MAP = {
  combat: SwordIcon,
  trade: HandshakeIcon,
  elimination: SkullIcon,
  system: SignalIcon,
  action: GearIcon,
} as const

export const TECH_ICONS = [
  { component: SeedlingIcon, name: 'Agriculture', color: '#4ade80' },
  { component: AnvilIcon, name: 'Bronze Working', color: '#60a5fa' },
  { component: ScrollIcon, name: 'Writing', color: '#fbbf24' },
  { component: BrainIcon, name: 'Philosophy', color: '#c084fc' },
  { component: GearIcon, name: 'Engineering', color: '#fb923c' },
  { component: StarIcon, name: 'Enlightenment', color: '#fbbf24' },
] as const

export const VICTORY_ICON_MAP = {
  domination: { component: SwordIcon, color: '#ef4444' },
  research: { component: FlaskIcon, color: '#a855f7' },
  economic: { component: CoinsIcon, color: '#eab308' },
} as const
