import type { Page } from '@playwright/test'

/**
 * Lista os campos da página sem limite: texto/textarea sem maxlength e número sem min/max.
 * Usado como guarda em cada tela com formulário.
 */
export async function camposSemLimite(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const semLimite: string[] = []
    const nome = (el: Element) => el.id || el.getAttribute('name') || el.outerHTML.slice(0, 80)
    const textuais = new Set(['', 'text', 'email', 'password', 'search', 'tel', 'url'])

    document.querySelectorAll<HTMLInputElement>('input').forEach((el) => {
      const tipo = el.getAttribute('type') ?? ''
      if (el.type === 'hidden' || el.disabled) return
      if (textuais.has(tipo) && !(el.maxLength > 0)) semLimite.push(`${nome(el)}: texto sem maxlength`)
      if (tipo === 'number' && (!el.hasAttribute('min') || !el.hasAttribute('max'))) semLimite.push(`${nome(el)}: número sem min/max`)
    })
    document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((el) => {
      if (!(el.maxLength > 0)) semLimite.push(`${nome(el)}: textarea sem maxlength`)
    })
    return semLimite
  })
}
