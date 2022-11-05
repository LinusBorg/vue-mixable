import type {
  ComputedOptions,
  MethodOptions,
  ComponentOptionsWithObjectProps,
  ComponentOptionsMixin,
  ComponentPropsOptions,
  EmitsOptions,
} from 'vue'

export /** #__PURE__*/ function defineMixin<
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string
>(
  options: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): typeof options {
  return options
}

// Test

const composable = defineMixin({
  props: {},
  data() {
    return {
      count: 0,
    }
  },
  watch: {
    count(count) {
      console.log('count', count, this.count)
    },
  },
  created() {
    this.count
  },
  computed: {
    doubleCount(): number {
      return this.count * 2
    },
  },
  methods: {
    logCounts() {
      console.log(this.count, this.doubleCount)
      return true
    },
  },
})

composable.count.value
composable.doubleCount.value
composable.logCounts()
