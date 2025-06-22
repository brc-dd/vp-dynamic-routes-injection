import { defineConfig } from 'vitepress'
import { injectDynamicRoutes } from './plugin'

export default defineConfig({
  cleanUrls: true,
  vite: {
    plugins: [injectDynamicRoutes(['bar', 'baz'])]
  }
})
