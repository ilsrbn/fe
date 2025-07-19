import {compileTemplate} from '../core/compiler'

export async function mount(ComponentClass: new () => any, mountPoint: HTMLElement) {
  const instance = new ComponentClass()
  const fragment = compileTemplate(instance.template, instance)
  mountPoint.appendChild(fragment)
}