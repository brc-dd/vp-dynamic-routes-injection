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
  const route = path.resolve(__dirname, './internal/[slug].md')

  return {
    name: 'custom:inject-dynamic-routes',
    config(config) {
      return {
        build: {
          rollupOptions: {
            input: Object.fromEntries(
              slugs.map((slug) => [
                `foo/${slug}.md`.replace(/\//g, '_'),
                path.resolve(config.root!, `foo/${slug}.md`)
              ])
            )
          }
        }
      }
    },
    configResolved(config) {
      const siteConfig = config.vitepress!
      siteConfig.pages = siteConfig.pages.filter((page) => !page.startsWith('foo/'))
      siteConfig.dynamicRoutes = siteConfig.dynamicRoutes.filter(
        (route) => !route.path.startsWith('foo/')
      )
      siteConfig.pages.push(...slugs.map((slug) => `foo/${slug}.md`))
      siteConfig.dynamicRoutes.push(
        ...slugs.map((slug) => ({
          path: `foo/${slug}.md`,
          fullPath: `${siteConfig.srcDir}/foo/${slug}.md`,
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
        }))
      )
      siteConfig.__dirty = true
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
