import path from 'node:path'
import { type PluginOption } from 'vite'
import { defineConfig, type SiteConfig } from 'vitepress'

export default defineConfig({
  cleanUrls: true,
  vite: {
    plugins: [injectDynamicRoutes(['bar', 'baz'])]
  }
})

function injectDynamicRoutes(slugs: string[]): PluginOption {
  const virtualRoute = path.resolve(__dirname, './internal/[slug].md')

  const routes = slugs.map((slug) => {
    const page = `foo/${slug}.md`

    return {
      path: page,
      route: virtualRoute,
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
        pages.map((page) => [page.replace(/\//g, '_'), path.resolve(config.root!, page)])
      )

      return { build: { rollupOptions: { input } } }
    },

    configResolved(resolved) {
      const siteConfig = resolved.vitepress
      if (!siteConfig || !siteConfig.__dirty) return

      siteConfig.pages.push(...pages)
      siteConfig.dynamicRoutes.push(
        ...routes.map((r) => ({ ...r, fullPath: path.resolve(siteConfig.srcDir, r.path) }))
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
