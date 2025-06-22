import { resolve } from 'node:path'
import type { PluginOption } from 'vite'
import type { SiteConfig } from 'vitepress'

export function injectDynamicRoutes(slugs: string[]): PluginOption {
  const route = resolve(__dirname, './[slug].md')

  const routes = slugs.map((slug) => {
    const path = `foo/${slug}.md`

    return {
      path,
      route,
      loaderPath: '/dev/null',
      params: { slug },
      content: `\
---
description: This is the description for ${slug}
---

# ${slug}

This is the content for ${slug}
`
    }
  })

  const pages = routes.map((route) => route.path)

  return {
    name: 'vitepress:inject-dynamic-routes',
    enforce: 'pre',

    config(config) {
      const input = Object.fromEntries(
        pages.map((page) => [page.replace(/\//g, '_'), resolve(config.root!, page)])
      )

      return { build: { rollupOptions: { input } } }
    },

    configResolved(resolved) {
      const siteConfig = resolved.vitepress
      if (!siteConfig || !siteConfig.__dirty) return

      siteConfig.pages.push(...pages)
      siteConfig.dynamicRoutes.push(
        ...routes.map((r) => ({ ...r, fullPath: resolve(siteConfig.srcDir, r.path) }))
      )
    }
  }
}

declare module 'vite' {
  interface UserConfig {
    vitepress?: SiteConfig
  }
}

declare module 'vitepress' {
  interface SiteConfig {
    __dirty?: boolean
  }
}
