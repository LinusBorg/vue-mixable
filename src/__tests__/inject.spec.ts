import { describe, test, expect } from 'vitest'
import { defineComponent, ref } from 'vue'
import { createComposableFromMixin } from '../createComposable'
import { wrapComposable } from './helpers'

describe('inject option', async () => {
  test('injects from mixin work', async () => {
    const mixin = {
      inject: {
        foo: {
          from: 'foo',
          default: 'bar',
        },
      },
      data(): { msg: string } {
        return {
          msg: (this as any).foo,
        }
      },
    }

    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div>{{ msg }}</div>`,
      }
    )

    expect(wrapper.vm.msg).toBe('bar')
  })

  test('provide works', async () => {
    const foo = ref('foo')
    const mixin = {
      provide: {
        foo,
      },
    }
    const Child = defineComponent({
      inject: ['foo'],
      template: `<div @click="foo = 'bar'">{{ foo }}</div>`,
    })
    const composable = createComposableFromMixin(mixin)
    const wrapper = wrapComposable(
      composable,
      {},
      {
        template: `<div><Child /></div>`,
        components: {
          Child,
        },
      }
    )

    const child = wrapper.findComponent(Child)
    expect(child.text()).toBe('foo')

    await child.find('div').trigger('click')
    expect(foo.value).toBe('bar')
    expect(child.text()).toBe('bar')
  })
})
