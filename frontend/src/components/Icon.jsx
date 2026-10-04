const icons = {
  arrowLeft: (
    <><path d="m15 18-6-6 6-6" /><path d="M9 12h12" /></>
  ),
  arrowRight: (
    <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>
  ),
  badge: (
    <><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2 4.5 2-1-9" /><path d="m10 8 1.3 1.3L14 6.8" /></>
  ),
  book: (
    <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chart: (
    <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  clipboard: (
    <><rect width="14" height="16" x="5" y="4" rx="2" /><path d="M9 4V2h6v2M9 12h6M9 16h4" /></>
  ),
  compass: (
    <><circle cx="12" cy="12" r="10" /><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" /></>
  ),
  file: (
    <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" /><path d="M14 2v6h6" /></>
  ),
  home: (
    <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>
  ),
  layers: (
    <><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>
  ),
  lock: (
    <><rect width="16" height="11" x="4" y="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>
  ),
  logout: (
    <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></>
  ),
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  quiz: (
    <><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 1 1 5.7 1.3c-.8 1.2-2.8 1.4-2.8 3.2M12 17h.01" /></>
  ),
  shield: (
    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>
  ),
  settings: (
    <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>
  ),
  sparkles: (
    <><path d="m12 3-1.3 3.7L7 8l3.7 1.3L12 13l1.3-3.7L17 8l-3.7-1.3L12 3Z" /><path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8L5 14ZM19 13l-.5 1.5L17 15l1.5.5L19 17l.5-1.5L21 15l-1.5-.5L19 13Z" /></>
  ),
  target: (
    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>
  ),
  trophy: (
    <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" /></>
  ),
  users: (
    <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>
  ),
}

export function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {icons[name]}
    </svg>
  )
}

export function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <span className={`grid place-items-center rounded-xl bg-violet-600 text-white shadow-sm ${className}`}>
      <Icon name="sparkles" className="h-5 w-5" />
    </span>
  )
}
