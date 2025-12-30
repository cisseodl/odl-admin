/**
 * Transitions - Système d'animations cohérent
 * Utilisé pour maintenir la cohérence des animations dans toute l'application
 */

export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
} as const

export const transitionColors = 'transition-colors duration-200 ease-in-out'
export const transitionTransform = 'transition-transform duration-200 ease-in-out'
export const transitionOpacity = 'transition-opacity duration-200 ease-in-out'

/**
 * Classes d'animation standardisées
 */
export const animations = {
  hover: 'hover:bg-accent transition-colors duration-200',
  focus: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200',
  scale: 'hover:scale-[1.02] transition-transform duration-200',
  fade: 'transition-opacity duration-200',
} as const

