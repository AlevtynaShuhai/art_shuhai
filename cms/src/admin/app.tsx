import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: ['en'],
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(app: StrapiApp) {
    // Strapi v5 admin customization
  },
};
