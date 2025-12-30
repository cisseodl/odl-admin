/**
 * Design Tokens - Système d'espacement cohérent
 * Utilisé pour maintenir la cohérence visuelle dans toute l'application
 */

export const spacing = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
} as const

/**
 * Classes Tailwind pour les gaps
 * Utilisez ces classes pour maintenir la cohérence
 */
export const gaps = {
  xs: 'gap-2',    // 8px
  sm: 'gap-3',    // 12px
  md: 'gap-4',    // 16px
  lg: 'gap-6',    // 24px
  xl: 'gap-8',    // 32px
} as const

/**
 * Classes Tailwind pour les espacements verticaux
 */
export const spaceY = {
  xs: 'space-y-2',    // 8px
  sm: 'space-y-3',    // 12px
  md: 'space-y-4',    // 16px
  lg: 'space-y-6',    // 24px
  xl: 'space-y-8',    // 32px
} as const

/**
 * Standard d'espacement recommandé
 * - Espacement entre sections : space-y-6 (24px)
 * - Espacement dans les cartes : space-y-4 (16px)
 * - Gap dans les grilles : gap-6 (24px)
 * - Padding des cartes : p-6 (24px)
 */
export const spacingStandards = {
  section: 'space-y-6',      // Entre sections principales
  card: 'space-y-4',         // Dans les cartes
  grid: 'gap-6',              // Dans les grilles
  cardPadding: 'p-6',         // Padding des cartes
  listItem: 'gap-4',         // Entre éléments de liste
} as const

