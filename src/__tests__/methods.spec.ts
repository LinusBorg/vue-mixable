import { describe, test, expect } from 'vitest'
import type { ComponentPublicInstance } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { wrapComposable } from './helpers'

describe('methods option', () => {
  test('methods are callable', async () => {
    const mixin = {
      methods: {
        msg() {
          return 'msg'
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg()).toBe('msg')
  })

  test('methods have access to `this`', async () => {
    const mixin = {
      methods: {
        msg() {
          return !!(this as unknown as ComponentPublicInstance).$emit
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg()).toBe(true)
  })

  test('methods have access to data from mixin', async () => {
    const mixin = {
      data: () => ({
        msg: 'Hello World',
      }),
      methods: {
        getMsg() {
          return (this as any).msg
        },
      },
    } as const

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).getMsg()).toBe('Hello World')
  })
})
