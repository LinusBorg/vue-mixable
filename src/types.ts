// TODO: replace with ComponentOptions or something
import type {
  ComponentProvideOptions,
  ComponentPublicInstance,
  ComputedGetter,
  DebuggerEvent,
  WatchCallback,
  WatchOptions,
  WritableComputedOptions,
} from 'vue'
type TData = Record<string, unknown>

export interface MethodOptions<Context = ComponentPublicInstance> {
  [key: string]: (
    this: ComponentPublicInstance & Context,
    ...args: any[]
  ) => any
}

export type ComputedOptions = Record<
  string,
  ComputedGetter<any> | WritableComputedOptions<any>
>
export type ContextualizedComputedOptions<Context, T = any> = Record<
  string,
  | ((this: ComponentPublicInstance & Context, ...args: any[]) => any)
  | {
      get(): T
      set(v: T): void
    }
>
export type ExtractComputedReturns<T extends any> = {
  [key in keyof T]: T[key] extends { get: (...args: any[]) => infer TReturn }
    ? TReturn
    : T[key] extends (...args: any[]) => infer TReturn
    ? TReturn
    : never
}

export type ComponentInjectOptions = string[] | ObjectInjectOptions

export type ObjectInjectOptions = Record<
  string | symbol,
  string | symbol | { from?: string | symbol; default?: unknown }
>
export type DebuggerHook = (e: DebuggerEvent) => void
export type ErrorCapturedHook<TError = unknown> = (
  err: TError,
  instance: ComponentPublicInstance | null,
  info: string
) => boolean | void

export type ObjectWatchOptionItem = {
  handler: WatchCallback | string
} & WatchOptions
type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem
export type ComponentWatchOptionItem = WatchOptionItem | WatchOptionItem[]

export type Mixin<
  D = TData,
  M = MethodOptions,
  C = ComputedOptions,
  Props = TData | string[],
  Emits = string[],
  Context = D & M & ExtractComputedReturns<C>,
  MM = MethodOptions<Context>,
  CC = ContextualizedComputedOptions<Context>
> = {
  props?: Props
  emits?: Emits

  mixins?: Array<Record<string, any>>

  data?: (vm?: ComponentPublicInstance) => D
  methods?: MM
  computed?: CC
  watch?: Record<
    string,
    WatchCallback | ({ handler: WatchCallback } & WatchOptions)
  >

  provide?: ComponentProvideOptions
  inject?: string[] | ObjectInjectOptions

  beforeCreate?(): void
  created?(): void
  beforeMount?(): void
  mounted?(): void
  beforeUpdate?(): void
  updated?(): void
  activated?(): void
  deactivated?(): void
  /** @deprecated use `beforeUnmount` instead */
  beforeDestroy?(): void
  beforeUnmount?(): void
  /** @deprecated use `unmounted` instead */
  destroyed?(): void
  unmounted?(): void
  renderTracked?: DebuggerHook
  renderTriggered?: DebuggerHook
  errorCaptured?: ErrorCapturedHook
}
export type Composable = (...args: unknown[]) => Record<string, any>

type Options<T = TData> = {
  data(): T
  name?: string
}

function test<Data extends TData>(obj: Options<Data>): Data {
  return obj.data()
}

const res = test({
  data() {
    return { a: 1 }
  },
  name: 'Bob',
})

res.a
