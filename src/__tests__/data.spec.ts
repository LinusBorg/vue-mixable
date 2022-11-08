import { describe, test, expect } from 'vitest'
import { nextTick } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
import { wrapComposable } from './helpers'

describe('data Option', () => {
  test('data usable in template', async () => {
    const mixin = defineMixin({
      props: {},
      data: () => ({
        msg: 'Hello World',
      }),
    } as const)

    const composable = createComposableFromMixin(mixin)
    // const wrapper =
    const wrapper = wrapComposable(composable)

    expect(wrapper.text()).toBe('Hello World')
  })
  test('data fn receives instance proxy', async () => {
    const mixin = defineMixin({
      props: {},
      data: (vm: any) => {
        return {
          msg: vm.$emit ? 'Hello World' : '',
        }
      },
    } as const)

    const composable = createComposableFromMixin(mixin)
    // const wrapper =
    const wrapper = wrapComposable(composable, {}, { withProxy: true })

    expect(wrapper.text()).toBe('Hello World')
  })
  test('data properties can be reactively reassigned', async () => {
    const mixin = defineMixin({
      props: {},
      data: () => {
        return {
          msg: 'A',
        }
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
    await nextTick()
    expect(wrapper.find('div').text()).toBe('B')
  })
})
