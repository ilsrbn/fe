# FE

**🧪 TypeScript-first микро-фреймворк для фронтенда**, вдохновлённый идеями Angular и Vapor-режима Vue. Основан на
fine-grained реактивности (`alien-signals`) без Virtual DOM.

## 🚀 Особенности

- Классовые компоненты (в стиле Angular)
- `template`-шаблоны с `{{ reactive }}` вставками
- `signal`, `computed`, `effect` из `alien-signals`
- `@click="method"` — поддержка событий
- Вложенные компоненты `<MyComponent />`
- Работает без виртуального DOM

---

## 🧱 Быстрый пример

```ts
import {signal, computed, effect, mount} from 'fe'

class CounterComponent {
  template = `
    <div>Count: {{ count }}</div>
    <button @click="increment">+1</button>
  `

  count = signal(0)
  double = computed(() => this.count() * 2)

  log = effect(() => console.log('count is', this.count()))

  increment() {
    this.count(this.count() + 1)
  }
}

mount(CounterComponent, document.body)
```

---

## 💡 Вложенные компоненты

```ts
class AppComponent {
  template = `
    <h1>App</h1>
    <CounterComponent />
  `

  components = {
    CounterComponent
  }
}
```

---

## 🛠 API

### Реактивность (из `alien-signals`)

```ts
signal(initialValue)
computed(() =>
...)
effect(() =>
...)
```

### Компоненты

```ts
class MyComponent {
  template = `<p>{{ text }}</p>`
  text = signal('Hello')
}
```

### События

```html

<button @click="myMethod">Click</button>
```

---

## 📄 Лицензия

MIT

---

## 🧠 Автор

Created by Илья Сербин
