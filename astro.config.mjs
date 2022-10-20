import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  integrations: [vue({jsx:true})],
  site: 'https://evgenykon.github.io',
  base: '/interview-trainer',
});