// types.ts
export type Reactive<T> = ReturnType<typeof import('alien-signals').signal<T>>;
export type R_Reactive<T> = ReturnType<typeof import('alien-signals').computed<T>>;
export type Effect = ReturnType<typeof import('alien-signals').effect>;
