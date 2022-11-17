import { describe, test, expect, vi } from 'vitest'
import { createComposableFromMixin } from '../createComposable'
import { defineMixin } from '../defineMixin'
import { wrapComposable } from './helpers'

// FIXME: needs to wait until feature is done.
describe.skip('advanced', () => {
  test('nested mixins', async () => {
    const innerSpy = vi.fn()
    const outerSpy = vi.fn()
    const innerMixin = defineMixin({
      props: {
        inner: Number,
      },
      data: () => ({
        nestedProperty: 'A',
        sharedProperty: 'A',
      }),
      created() {
        innerSpy()
      },
      mounted() {
        innerSpy()
      },
    })
    const outerMixin = defineMixin({
      mixins: [innerMixin],
      props: {
        outer: String,
      },
      data: () => ({
        msg: 'Hello World',
        sharedProperty: 'B',
      }),
      computed: {
        getNestedProperty(): string {
          return this.nestedProperty
        },
      },
      mounted() {
        outerSpy()
      },
    })
    // eslint-disable-next-line no-autofix/unused-imports/no-unused-vars
    const innerComposable = createComposableFromMixin(innerMixin)

    const outerComposable = createComposableFromMixin(outerMixin)
    const wrapper = wrapComposable(
      outerComposable,
      {
        props: {
          outer: 'Hello',
          inner: 10,
        },
      },
      {
        props: outerComposable.props,
      }
    )
    // Props
    expect(wrapper.vm.outer).toBe('Hello')
    expect(wrapper.vm.inner).toBe(10)
    // Data & computed
    expect(wrapper.vm.sharedProperty).toBe('B')
    expect(wrapper.vm.getNestedProperty).toBe('A')
    // Lifecycle Hooks
    expect(innerSpy).toHaveBeenCalledTimes(2)
    expect(outerSpy).toHaveBeenCalledTimes(1)
  })
})
