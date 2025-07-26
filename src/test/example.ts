import { computed, signal } from "alien-signals";

export default class Root_Component {
  template: string = `
  <div @click="onClick">{{ a + b }}</div><p :is-odd="b + a">{{
  a + b }}</p>
  `;
  a = signal(2);
  b = signal(8);
  isOdd = computed(() => {
    const v = this.a() + this.b();
    return v % 2 === 0;
  });
  onClick() {
    this.a(this.a() + 1);
    this.b(this.b() + 1);
  }
}
