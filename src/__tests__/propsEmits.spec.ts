import { describe, test, expect, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
// import { wrapComposable } from './helpers'

describe('props', () => {
  test('props as property on composable', async () => {
    const mixin = defineMixin({
      props: {
        foo: String,
      },
    })

    const composable = createComposableFromMixin(mixin)
    const Comp = defineComponent({
      props: composable.props,
      template: `<div>{{ foo }}</div>`,
    })

    const wrapper = await mount(Comp, {
      props: {
        foo: 'bar',
      },
    })

    expect(wrapper.find('div').text()).toBe('bar')
  })
})

describe('emits', () => {
  test('emits option on composable', async () => {
    const mixin = defineMixin({
      props: {},
      emits: ['foo'],
    })

    const composable = createComposableFromMixin(mixin)
    const Comp = defineComponent({
      emits: composable.emits,
      template: `<button @click="$emit('foo')">Click me</button>`,
    })
    const spy = vi.fn()
    const wrapper = await mount(Comp, {
      props: {
        onFoo: spy,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(spy).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted()).toHaveProperty('foo')
  })
})
