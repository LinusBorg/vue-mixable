/**
 * This file is not to be used anywhere, it's just to test the type inference
 */
import { defineComponent } from 'vue'
import { createComposableFromMixin } from './createComposable'
import { defineMixin } from './defineMixin'

interface User {
  name: string
  street: string
  city: string
  hobbies: string[]
}

const mixin = defineMixin({
  props: {
    show: { type: Boolean },
    msg: { type: String, required: true },
  },
  emits: {
    // eslint-disable-next-line no-autofix/unused-imports/no-unused-vars
    'update:show': (value?: any) => true,
  },
  data: () => ({
    msg: 'Hello World',
    age: 10,
    user: {} as User,
  }),
  computed: {
    birthYear(): number {
      return new Date().getFullYear() - this.age
    },
  },
  methods: {
    testFn(): void {
      console.log(this.user)
    },
  },
} as const)

const testComposable = createComposableFromMixin(mixin)

/* eslint-disable no-autofix/unused-imports/no-unused-vars */
const Comp = defineComponent({
  setup() {
    const state = testComposable()

    state.age
    state.msg
    state.user.value
    state.birthYear
    state.testFn()
  },
})

const props = testComposable.props
const emits = testComposable.emits

const CompWMixin = defineComponent({
  mixins: [mixin],
})

type TCompWMixin = InstanceType<typeof CompWMixin>
type checkAge = TCompWMixin['age']
type checkUser = TCompWMixin['user']
