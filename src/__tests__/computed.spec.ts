import { describe, test, expect } from 'vitest'
import type { ComponentPublicInstance } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { wrapComposable } from './helpers'

describe('computed option', async () => {
  test('computed are readable', async () => {
    const mixin = {
      computed: {
        msg() {
          return 'msg'
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe('msg')
  })

  test('writeable computeds work', async () => {
    const mixin = {
      data: () => ({
        internalMsg: 'A',
      }),
      computed: {
        msg: {
          get() {
            return (this as any).internalMsg
          },
          set(v: string) {
            ;(this as any).internalMsg = v
          },
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div>{{ msg }}</div><button @click="msg = 'B'">Click</button>`,
      }
    )

    expect(wrapper.find('div').text()).toBe('A')
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toBe('B')
  })

  test('computed have access to `this`', async () => {
    const mixin = {
      computed: {
        msg() {
          return !!(this as unknown as ComponentPublicInstance).$emit
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe(true)
  })

  test('computed have access to data from mixin', async () => {
    const mixin = {
      data: () => ({
        foo: 'Hello World',
      }),
      computed: {
        msg() {
          return (this as any).foo
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe('Hello World')
  })
})
