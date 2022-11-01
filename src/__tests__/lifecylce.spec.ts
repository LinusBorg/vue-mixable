import { describe, test, expect, vi } from 'vitest'
import { createComposableFromMixin } from '../createComposable'
import { wrapComposable } from './helpers'

describe('Lifecycle hooks', async () => {
  test('normal lifecycle hooks are called with proper `this`', async () => {
    const spy = vi.fn()
    function testHandler() {
      // @ts-expect-error - doesn't like this for some reason
      if ((this as any).$emit) spy()
    }
    const mixin = {
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
    }

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
})
