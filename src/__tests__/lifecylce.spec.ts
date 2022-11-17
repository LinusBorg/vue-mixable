import { describe, test, expect, vi } from 'vitest'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
import { wrapComposable } from './helpers'

describe('Lifecycle hooks', async () => {
  test('are called with proper `this`', async () => {
    const spy = vi.fn()
    function testHandler() {
      // @ts-expect-error - doesn't like this for some reason
      if ((this as any).$emit) spy()
    }
    const mixin = defineMixin({
      props: {},
      data: () => ({
        msg: 'A',
      }),
      beforeCreate: testHandler,
      created: testHandler,
      beforeMount: testHandler,
      mounted: testHandler,
      beforeUpdate: testHandler,
      updated: testHandler,
      beforeUnmount: testHandler,
      unmounted: testHandler,
    })

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div>{{ msg }}</div><button @click="msg = 'B'">Click</button>`,
      }
    )

    expect(spy).toHaveBeenCalledTimes(4)

    await wrapper.find('button').trigger('click')

    expect(spy).toHaveBeenCalledTimes(6)

    await wrapper.unmount()

    expect(spy).toHaveBeenCalledTimes(8)
  })

  test('can read and set custom properties on `this`', async () => {
    const mixin = defineMixin({
      props: {},
      beforeCreate() {
        ;(this as any).custom = 'A'
      },
      created() {
        expect((this as any).custom).toBe('A')
      },
    })

    const composable = createComposableFromMixin(mixin)

    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div/>`,
      }
    )

    expect((wrapper.vm as any).custom).toBe('A')
  })
})
