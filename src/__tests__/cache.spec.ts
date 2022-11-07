import { describe, test, expect } from 'vitest'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'

describe('cache', () => {
  test('works', () => {
    const mixin = defineMixin({
      props: {},
      data: () => ({
        msg: 'Hello World',
      }),
    })

    const composable1 = createComposableFromMixin(mixin)
    const composable2 = createComposableFromMixin(mixin)

    expect(composable1).toBe(composable2)
  })
})
