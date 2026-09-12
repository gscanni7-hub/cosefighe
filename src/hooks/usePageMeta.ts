import { useEffect } from 'react'

interface PageMeta {
  title: string
  description: string
  image?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Imposta titolo, description e Open Graph della pagina. */
export function usePageMeta({ title, description, image }: PageMeta) {
  useEffect(() => {
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    const canonical = window.location.origin + window.location.pathname
    setMeta('property', 'og:url', canonical)
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
    if (image) {
      const abs = new URL(image, window.location.origin).toString()
      setMeta('property', 'og:image', abs)
      setMeta('name', 'twitter:image', abs)
    }
  }, [title, description, image])
}
