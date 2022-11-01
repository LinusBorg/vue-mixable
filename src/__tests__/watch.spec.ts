import { describe, test, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { wrapComposable } from './helpers'

describe('watch option', async () => {
  test('string watch', async () => {
    const spy = vi.fn()
    const mixin = {
      data: () => ({
        msg: 'A',
      }),
      watch: {
        msg(...args: any[]) {
          console.log('watch msg', args)
          spy(...args)
        },
      },
    }

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div>{{ msg }}</div><button @click="msg = 'B'">Click</button>`,
      }
    )

    expect(spy).toHaveBeenCalledTimes(0)

    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(wrapper.vm.msg).toBe('B')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith('B', 'A', expect.any(Function))
  })
})
