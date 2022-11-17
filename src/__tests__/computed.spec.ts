import { describe, test, expect } from 'vitest'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
import { wrapComposable } from './helpers'

describe('computed option', async () => {
  test('computed are readable', async () => {
    const mixin = defineMixin({
      props: {},
      computed: {
        msg() {
          return 'msg'
        },
      },
    } as const)

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe('msg')
  })

  test('writeable computeds work', async () => {
    const mixin = defineMixin({
      props: {},
      data: () => ({
        internalMsg: 'A',
      }),
      computed: {
        msg: {
          get(): string {
            return this.internalMsg
          },
          set(v: string) {
            this.internalMsg = v
          },
        },
      },
    } as const)

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
    const mixin = defineMixin({
      props: {},
      computed: {
        msg() {
          return !!this.$emit
        },
      },
    } as const)

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe(true)
  })

  test('computed have access to data from mixin', async () => {
    const mixin = defineMixin({
      props: {},
      data: () => ({
        foo: 'Hello World',
      }),
      computed: {
        msg(): string {
          return this.foo
        },
      },
    } as const)

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(composable)

    expect((wrapper.vm as any).msg).toBe('Hello World')
  })
})
