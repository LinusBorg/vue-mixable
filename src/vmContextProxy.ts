import type { ComponentPublicInstance } from 'vue'

export /* #__PURE__ */ function createContextProxy(
  _vm: ComponentPublicInstance,
  context: Record<string, any>
) {
  return new Proxy(_vm, {
    get(vm, key, receiver) {
      if (key in context) {
        return Reflect.get(context, key, receiver)
      } else {
        return (vm as any)[key]
      }
    },
    set(vm, key, value, receiver) {
      if (key in context) {
        return Reflect.set(context, key, value, receiver)
      } else {
        return Reflect.set(vm, key, value)
      }
    },
    has(vm, property) {
      return Reflect.has(context, property) || Reflect.has(vm, property)
    },
    getOwnPropertyDescriptor(vm, property) {
      if (property in context) {
        return Reflect.getOwnPropertyDescriptor(context, property)
      } else {
        return Reflect.getOwnPropertyDescriptor(vm, property)
      }
    },
    defineProperty(vm, property, descriptor) {
      return Reflect.defineProperty(vm, property, descriptor)
    },
    deleteProperty(vm, property) {
      if (property in context) {
        return Reflect.deleteProperty(context, property)
      } else {
        return Reflect.deleteProperty(vm, property)
      }
    },
  })
}
