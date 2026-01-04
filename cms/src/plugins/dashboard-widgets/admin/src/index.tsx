import { ChartPie } from '@strapi/icons';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: ChartPie,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'Dashboard',
      },
      permissions: [],
      position: 0,
      Component: async () => {
        const { DashboardPage } = await import('./pages/DashboardPage');
        return DashboardPage;
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => ({
        data: {
          [`${PLUGIN_ID}.plugin.name`]: 'Dashboard',
        },
        locale,
      }))
    );
  },
};
