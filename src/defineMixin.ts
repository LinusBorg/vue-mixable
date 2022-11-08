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
