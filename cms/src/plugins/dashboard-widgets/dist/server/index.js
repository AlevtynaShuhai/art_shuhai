"use strict";
const bootstrap = async ({ strapi }) => {
};
const register = ({ strapi }) => {
};
const destroy = ({ strapi }) => {
};
const controllers = {
  controller: ({ strapi }) => ({
    async getStats(ctx) {
      try {
        const allLeads = await strapi.documents("api::lead.lead").findMany({
          sort: { createdAt: "desc" }
        });
        const paidLeads = allLeads.filter((l) => l.paymentStatus === "paid");
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
        const newOrders = allLeads.filter(
          (l) => l.paymentStatus === "paid" && l.orderStatus === "new" || l.createdAt > oneDayAgo && !l.seenAt
        );
        const eventCounts = {};
        for (const lead of paidLeads) {
          const eventName = lead.eventName || "Unknown";
          if (!eventCounts[eventName]) {
            eventCounts[eventName] = { name: eventName, count: 0, revenue: 0 };
          }
          eventCounts[eventName].count += 1;
          eventCounts[eventName].revenue += Number(lead.amountPaid) || Number(lead.eventPrice) || 0;
        }
        const eventStats = Object.values(eventCounts).sort((a, b) => b.count - a.count).slice(0, 10);
        const totalRevenue = paidLeads.reduce(
          (sum, lead) => sum + (Number(lead.amountPaid) || Number(lead.eventPrice) || 0),
          0
        );
        const period = ctx.query.period || "7d";
        const periodConfig = {
          "7d": { days: 7, groupBy: "day" },
          "30d": { days: 30, groupBy: "day" },
          "90d": { days: 90, groupBy: "week" },
          "1y": { days: 365, groupBy: "month" },
          "all": { days: 9999, groupBy: "month" }
        };
        const config = periodConfig[period] || periodConfig["7d"];
        const revenueByDay = [];
        const today = /* @__PURE__ */ new Date();
        today.setHours(23, 59, 59, 999);
        const getLocalDateStr = (dateInput) => {
          const d = new Date(dateInput);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        };
        if (config.groupBy === "day") {
          for (let i = config.days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = getLocalDateStr(date);
            const dayLeads = paidLeads.filter((l) => {
              const leadDateStr = l.paidAt || l.createdAt;
              if (!leadDateStr) return false;
              return getLocalDateStr(leadDateStr) === dateStr;
            });
            revenueByDay.push({
              date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              revenue: Math.round(dayLeads.reduce((sum, l) => sum + (Number(l.amountPaid) || 0), 0) * 100) / 100,
              orders: dayLeads.length
            });
          }
        } else if (config.groupBy === "week") {
          const weeks = Math.ceil(config.days / 7);
          for (let i = weeks - 1; i >= 0; i--) {
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() - i * 7);
            weekEnd.setHours(23, 59, 59, 999);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);
            weekStart.setHours(0, 0, 0, 0);
            const weekLeads = paidLeads.filter((l) => {
              const leadDate = new Date(l.paidAt || l.createdAt);
              return leadDate >= weekStart && leadDate <= weekEnd;
            });
            revenueByDay.push({
              date: `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              revenue: Math.round(weekLeads.reduce((sum, l) => sum + (Number(l.amountPaid) || 0), 0) * 100) / 100,
              orders: weekLeads.length
            });
          }
        } else {
          const monthsMap = {};
          for (const lead of paidLeads) {
            const leadDate = new Date(lead.paidAt || lead.createdAt);
            const monthKey = `${leadDate.getFullYear()}-${String(leadDate.getMonth() + 1).padStart(2, "0")}`;
            if (!monthsMap[monthKey]) {
              monthsMap[monthKey] = { revenue: 0, orders: 0, date: new Date(leadDate.getFullYear(), leadDate.getMonth(), 1) };
            }
            monthsMap[monthKey].revenue += Number(lead.amountPaid) || 0;
            monthsMap[monthKey].orders += 1;
          }
          const sortedMonths = Object.entries(monthsMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
          for (const [, data] of sortedMonths) {
            revenueByDay.push({
              date: data.date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
              revenue: Math.round(data.revenue * 100) / 100,
              orders: data.orders
            });
          }
        }
        ctx.body = {
          data: {
            summary: {
              newOrders: newOrders.length,
              totalOrders: paidLeads.length,
              totalRevenue: Math.round(totalRevenue * 100) / 100
            },
            recentOrders: newOrders.slice(0, 10).map((lead) => ({
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
              orderDate: lead.paidAt || lead.createdAt
              // actual order/payment date
            })),
            eventStats,
            revenueByDay
          }
        };
      } catch (error) {
        ctx.throw(500, error);
      }
    },
    async markAsSeen(ctx) {
      try {
        const { documentId } = ctx.params;
        await strapi.documents("api::lead.lead").update({
          documentId,
          data: {
            orderStatus: "viewed",
            seenAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        ctx.body = { success: true };
      } catch (error) {
        ctx.throw(500, error);
      }
    }
  })
};
const routes = {
  admin: {
    type: "admin",
    routes: [
      {
        method: "GET",
        path: "/stats",
        handler: "controller.getStats",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      },
      {
        method: "POST",
        path: "/mark-seen/:documentId",
        handler: "controller.markAsSeen",
        config: {
          policies: ["admin::isAuthenticatedAdmin"]
        }
      }
    ]
  }
};
const index = {
  register,
  bootstrap,
  destroy,
  controllers,
  routes
};
module.exports = index;
