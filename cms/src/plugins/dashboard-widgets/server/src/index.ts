import type { Core } from '@strapi/strapi';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {};
const register = ({ strapi }: { strapi: Core.Strapi }) => {};
const destroy = ({ strapi }: { strapi: Core.Strapi }) => {};

const controllers = {
  controller: ({ strapi }: { strapi: Core.Strapi }) => ({
    async getStats(ctx: any) {
      try {
        // Get all leads for stats
        const allLeads = await strapi.documents('api::lead.lead').findMany({
          sort: { createdAt: 'desc' },
        });

        // Paid leads for revenue calculations
        const paidLeads = allLeads.filter((l: any) => l.paymentStatus === 'paid');

        // New orders: paid + orderStatus new, OR just created in last 24h (any status)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const newOrders = allLeads.filter((l: any) =>
          (l.paymentStatus === 'paid' && l.orderStatus === 'new') ||
          (l.createdAt > oneDayAgo && !l.seenAt)
        );

        const eventCounts: Record<string, { name: string; count: number; revenue: number }> = {};
        for (const lead of paidLeads as any[]) {
          const eventName = lead.eventName || 'Unknown';
          if (!eventCounts[eventName]) {
            eventCounts[eventName] = { name: eventName, count: 0, revenue: 0 };
          }
          eventCounts[eventName].count += 1;
          eventCounts[eventName].revenue += Number(lead.amountPaid) || Number(lead.eventPrice) || 0;
        }

        const eventStats = Object.values(eventCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const totalRevenue = paidLeads.reduce(
          (sum: number, lead: any) => sum + (Number(lead.amountPaid) || Number(lead.eventPrice) || 0),
          0
        );

        // Revenue by period
        const period = ctx.query.period || '7d';
        const periodConfig: Record<string, { days: number; groupBy: 'day' | 'week' | 'month' }> = {
          '7d': { days: 7, groupBy: 'day' },
          '30d': { days: 30, groupBy: 'day' },
          '90d': { days: 90, groupBy: 'week' },
          '1y': { days: 365, groupBy: 'month' },
          'all': { days: 9999, groupBy: 'month' },
        };
        const config = periodConfig[period] || periodConfig['7d'];

        const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Helper to get date string in local timezone (YYYY-MM-DD)
        const getLocalDateStr = (dateInput: string | Date): string => {
          const d = new Date(dateInput);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        if (config.groupBy === 'day') {
          for (let i = config.days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getLocalDateStr(date);
            const dayLeads = paidLeads.filter((l: any) => {
              const leadDateStr = l.paidAt || l.createdAt;
              if (!leadDateStr) return false;
              return getLocalDateStr(leadDateStr) === dateStr;
            });
            revenueByDay.push({
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              revenue: Math.round(dayLeads.reduce((sum: number, l: any) => sum + (Number(l.amountPaid) || 0), 0) * 100) / 100,
              orders: dayLeads.length,
            });
          }
        } else if (config.groupBy === 'week') {
          const weeks = Math.ceil(config.days / 7);
          for (let i = weeks - 1; i >= 0; i--) {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() - i * 7);
            weekEnd.setHours(23, 59, 59, 999);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);

            const weekLeads = paidLeads.filter((l: any) => {
              const leadDate = new Date(l.paidAt || l.createdAt);
              return leadDate >= weekStart && leadDate <= weekEnd;
            });
            revenueByDay.push({
              date: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
              revenue: Math.round(weekLeads.reduce((sum: number, l: any) => sum + (Number(l.amountPaid) || 0), 0) * 100) / 100,
              orders: weekLeads.length,
            });
          }
        } else {
          // Group by month
          const monthsMap: Record<string, { revenue: number; orders: number; date: Date }> = {};
          for (const lead of paidLeads as any[]) {
            const leadDate = new Date(lead.paidAt || lead.createdAt);
            const monthKey = `${leadDate.getFullYear()}-${String(leadDate.getMonth() + 1).padStart(2, '0')}`;
            if (!monthsMap[monthKey]) {
              monthsMap[monthKey] = { revenue: 0, orders: 0, date: new Date(leadDate.getFullYear(), leadDate.getMonth(), 1) };
            }
            monthsMap[monthKey].revenue += Number(lead.amountPaid) || 0;
            monthsMap[monthKey].orders += 1;
          }
          const sortedMonths = Object.entries(monthsMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12);
          for (const [, data] of sortedMonths) {
            revenueByDay.push({
              date: data.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              revenue: Math.round(data.revenue * 100) / 100,
              orders: data.orders,
            });
          }
        }

        ctx.body = {
          data: {
            summary: {
              newOrders: newOrders.length,
              totalOrders: paidLeads.length,
              totalRevenue: Math.round(totalRevenue * 100) / 100,
            },
            recentOrders: newOrders.slice(0, 10).map((lead: any) => ({
              id: lead.id,
              documentId: lead.documentId,
              name: lead.name,
              email: lead.email,
              eventName: lead.eventName,
              eventDate: lead.eventDate,
              amountPaid: lead.amountPaid,
              paymentStatus: lead.paymentStatus,
              createdAt: lead.createdAt,
              paidAt: lead.paidAt,
              orderDate: lead.paidAt || lead.createdAt, // actual order/payment date
            })),
            eventStats,
            revenueByDay,
          },
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async markAsSeen(ctx: any) {
      try {
        const { documentId } = ctx.params;

        await strapi.documents('api::lead.lead').update({
          documentId,
          data: {
            orderStatus: 'viewed',
            seenAt: new Date().toISOString(),
          },
        });

        ctx.body = { success: true };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  }),
};

const routes = {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/stats',
        handler: 'controller.getStats',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
      {
        method: 'POST',
        path: '/mark-seen/:documentId',
        handler: 'controller.markAsSeen',
        config: {
          policies: ['admin::isAuthenticatedAdmin'],
        },
      },
    ],
  },
};

export default {
  register,
  bootstrap,
  destroy,
  controllers,
  routes,
};
