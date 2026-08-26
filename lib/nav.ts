export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
  prefetch?: boolean;
  badge?: string | number;
}

export const adminNavItems: NavItemConfig[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊', prefetch: true },
  { label: 'Teams & Members', href: '/admin/teams', icon: '👥', prefetch: false },
  { label: 'Problem Statements', href: '/admin/problem-statements', icon: '📋', prefetch: false },
  { label: 'Evaluators & Jury', href: '/admin/evaluators', icon: '🎓', prefetch: false },
  { label: 'Criteria Builder', href: '/admin/criteria', icon: '🎯', prefetch: true },
  { label: 'Round 1 Mapping', href: '/admin/assignments', icon: '📌', prefetch: false },
  { label: 'Audit Trail', href: '/admin/audit', icon: '🛡️', prefetch: true },
  { label: 'Merit & Reports', href: '/reports', icon: '🏆', prefetch: true },
];
