import { describe, test, expect } from 'vitest'
import type { ComponentPublicInstance } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
import { wrapComposable } from './helpers'

describe('methods option', () => {
  test('methods are callable', async () => {
    const mixin = defineMixin({
      props: {},
      methods: {
        msg() {
          return 'msg'
        },
      },
    })

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg()).toBe('msg')
  })

  test('methods have access to `this`', async () => {
    const mixin = defineMixin({
      props: {},
      methods: {
        msg() {
          return !!(this as unknown as ComponentPublicInstance).$emit
        },
      },
    })

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg()).toBe(true)
  })

  test('methods have access to data from mixin', async () => {
    const mixin = defineMixin({
      props: {},
      data: () => ({
        msg: 'Hello World',
      }),
      methods: {
        getMsg() {
          return (this as any).msg
        },
      },
    })

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).getMsg()).toBe('Hello World')
  })
})
