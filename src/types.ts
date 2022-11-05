/**
 * @legal
 * Various types in this file are based on code from the Vue 3 codebase:
 * https://github.com/vuejs/core/blob/f67bb500b6071bc0e55a89709a495a27da73badd/packages/runtime-core/src/componentOptions.ts
 */

// TODO: replace with ComponentOptions or something
import type {
  ComponentPublicInstance,
  ComputedGetter,
  EmitsOptions,
  ObjectEmitsOptions,
  WatchCallback,
  WatchOptions,
  WritableComputedOptions,
} from 'vue'

export type EmitsToProps<T extends EmitsOptions> = T extends string[]
  ? {
      [K in string & `on${Capitalize<T[number]>}`]?: (...args: any[]) => any
    }
  : T extends ObjectEmitsOptions
  ? {
      [K in string &
        `on${Capitalize<string & keyof T>}`]?: K extends `on${infer C}`
        ? T[Uncapitalize<C>] extends null
          ? (...args: any[]) => any
          : (
              ...args: T[Uncapitalize<C>] extends (...args: infer P) => any
                ? P
                : never
            ) => any
        : never
    }
  : {}

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

export type ObjectWatchOptionItem = {
  handler: WatchCallback | string
} & WatchOptions
type WatchOptionItem = string | WatchCallback | ObjectWatchOptionItem
export type ComponentWatchOptionItem = WatchOptionItem | WatchOptionItem[]
