import type { createComposableFromMixin } from './createComposable'
import type { defineMixin } from './defineMixin'

export const cache = new Map<
  typeof createComposableFromMixin,
  typeof defineMixin
>()
