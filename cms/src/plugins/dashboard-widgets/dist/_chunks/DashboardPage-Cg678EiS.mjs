import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Flex, Loader, Typography, Badge, Link, Button } from "@strapi/design-system";
import { o as o5, C as Cn, K as K2, L as Ln, P as PLUGIN_ID, G as Gn, t as t5 } from "./index-r_AVjy7E.mjs";
import { useFetchClient } from "@strapi/strapi/admin";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, Line } from "recharts";
const PaymentStatusBadge = ({ status }) => {
  const config = {
    paid: { bg: "#C6F0C2", color: "#0D882B", label: "Paid" },
    pending: { bg: "#FEE2B3", color: "#BE5D01", label: "Pending" },
    failed: { bg: "#F5C0B8", color: "#B72B1A", label: "Failed" },
    refunded: { bg: "#D9D8FF", color: "#4945FF", label: "Refunded" }
  };
  const { bg, color, label } = config[status] || config.pending;
  return /* @__PURE__ */ jsxs("span", { style: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 4,
    backgroundColor: bg,
    color,
    fontSize: 11,
    fontWeight: 600
  }, children: [
    /* @__PURE__ */ jsx("span", { style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: color
    } }),
    label
  ] });
};
const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "primary"
}) => {
  const colorMap = {
    primary: { bg: "primary100", iconBg: "primary200", text: "primary700" },
    success: { bg: "success100", iconBg: "success200", text: "success700" },
    warning: { bg: "warning100", iconBg: "warning200", text: "warning700" }
  };
  const colors = colorMap[color];
  return /* @__PURE__ */ jsx(
    Box,
    {
      padding: 5,
      background: colors.bg,
      hasRadius: true,
      shadow: "filterShadow",
      style: { minWidth: 0 },
      children: /* @__PURE__ */ jsxs(Flex, { gap: 4, alignItems: "center", children: [
        /* @__PURE__ */ jsx(
          Box,
          {
            padding: 3,
            background: colors.iconBg,
            hasRadius: true,
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            },
            children: /* @__PURE__ */ jsx(Icon, { width: 24, height: 24 })
          }
        ),
        /* @__PURE__ */ jsxs(Box, { style: { minWidth: 0, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsx(
            Typography,
            {
              variant: "pi",
              textColor: "neutral600",
              style: {
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: 11,
                marginBottom: 4,
                display: "block"
              },
              children: label
            }
          ),
          /* @__PURE__ */ jsx(Typography, { variant: "alpha", textColor: colors.text, children: value })
        ] })
      ] })
    }
  );
};
const formatOrderDate = (dateStr) => {
  if (!dateStr) return "No date";
  const date = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
const OrderCard = ({
  order,
  onMarkSeen
}) => {
  const truncate = (str, max) => str && str.length > max ? str.slice(0, max) + "..." : str;
  return /* @__PURE__ */ jsx(
    Box,
    {
      padding: 3,
      background: "neutral0",
      hasRadius: true,
      style: {
        border: "1px solid #EAEAEF",
        marginBottom: 8
      },
      children: /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "flex-start", gap: 2, children: [
        /* @__PURE__ */ jsxs(Flex, { alignItems: "flex-start", gap: 3, style: { minWidth: 0, flex: 1 }, children: [
          /* @__PURE__ */ jsxs(
            Box,
            {
              background: "success100",
              hasRadius: true,
              padding: 2,
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                flexShrink: 0
              },
              children: [
                /* @__PURE__ */ jsx(Gn, { width: 16, height: 16 }),
                /* @__PURE__ */ jsx("span", { style: {
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#0D882B",
                  border: "2px solid white"
                } })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(Box, { style: { minWidth: 0, flex: 1 }, children: [
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "omega",
                fontWeight: "bold",
                style: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  maxWidth: "100%"
                },
                title: order.name,
                children: truncate(order.name, 25)
              }
            ),
            /* @__PURE__ */ jsx(
              Typography,
              {
                variant: "pi",
                textColor: "neutral500",
                style: {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  maxWidth: "100%"
                },
                title: order.email,
                children: truncate(order.email, 30)
              }
            ),
            /* @__PURE__ */ jsxs(Flex, { alignItems: "center", gap: 2, marginTop: 1, style: { flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsx(
                Typography,
                {
                  variant: "pi",
                  textColor: "neutral700",
                  style: {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: 150
                  },
                  title: order.eventName,
                  children: truncate(order.eventName, 20)
                }
              ),
              /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral400", children: "|" }),
              /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "primary600", fontWeight: "semiBold", children: formatOrderDate(order.orderDate) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "flex-end", gap: 2, style: { flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxs(Typography, { variant: "omega", textColor: "success600", fontWeight: "bold", children: [
            "$",
            order.amountPaid?.toFixed(2) || "0.00"
          ] }),
          /* @__PURE__ */ jsx(PaymentStatusBadge, { status: order.paymentStatus }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => onMarkSeen(order.documentId),
              variant: "success-light",
              size: "S",
              startIcon: /* @__PURE__ */ jsx(t5, { width: 12, height: 12 }),
              style: { marginTop: 4 },
              children: "Mark seen"
            }
          )
        ] })
      ] })
    }
  );
};
const EventBar = ({ stat, maxCount }) => {
  const percentage = maxCount > 0 ? stat.count / maxCount * 100 : 0;
  const truncate = (str, max) => str && str.length > max ? str.slice(0, max) + "..." : str;
  return /* @__PURE__ */ jsxs(Box, { style: { marginBottom: 12 }, children: [
    /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 1, children: [
      /* @__PURE__ */ jsx(
        Typography,
        {
          variant: "pi",
          textColor: "neutral800",
          style: {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%"
          },
          title: stat.name,
          children: truncate(stat.name, 30)
        }
      ),
      /* @__PURE__ */ jsxs(Flex, { alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsx(Typography, { variant: "pi", fontWeight: "bold", textColor: "primary600", children: stat.count }),
        /* @__PURE__ */ jsxs(Typography, { variant: "pi", textColor: "neutral500", children: [
          "($",
          stat.revenue.toFixed(0),
          ")"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Box,
      {
        style: {
          width: "100%",
          height: 8,
          backgroundColor: "#EAEAEF",
          borderRadius: 4,
          overflow: "hidden"
        },
        children: /* @__PURE__ */ jsx(
          Box,
          {
            style: {
              width: `${percentage}%`,
              height: "100%",
              backgroundColor: "#4945FF",
              borderRadius: 4,
              transition: "width 0.3s ease"
            }
          }
        )
      }
    )
  ] });
};
const periodLabels = {
  "7d": "7 Days",
  "30d": "Month",
  "90d": "Quarter",
  "1y": "Year",
  "all": "All Time"
};
const DashboardPage = () => {
  const { get, post } = useFetchClient();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("7d");
  const fetchData = async (selectedPeriod = period) => {
    try {
      setLoading(true);
      const response = await get(`/${PLUGIN_ID}/stats?period=${selectedPeriod}`);
      setData(response.data?.data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };
  const markAsSeen = async (documentId) => {
    try {
      await post(`/${PLUGIN_ID}/mark-seen/${documentId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to mark as seen:", err);
    }
  };
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3e4);
    return () => clearInterval(interval);
  }, []);
  if (loading && !data) {
    return /* @__PURE__ */ jsx(Box, { padding: 6, background: "neutral100", style: { minHeight: "100vh" }, children: /* @__PURE__ */ jsx(Flex, { justifyContent: "center", alignItems: "center", style: { minHeight: "400px" }, children: /* @__PURE__ */ jsx(Loader, {}) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx(Box, { padding: 6, background: "neutral100", children: /* @__PURE__ */ jsx(Box, { padding: 4, background: "danger100", hasRadius: true, children: /* @__PURE__ */ jsx(Typography, { textColor: "danger600", children: error }) }) });
  }
  const maxEventCount = Math.max(...data?.eventStats?.map((s) => s.count) || [1]);
  return /* @__PURE__ */ jsxs(Box, { padding: 6, background: "neutral100", style: { minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 5, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "alpha", children: "Dashboard" }),
      /* @__PURE__ */ jsxs(Flex, { alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsx(o5, { width: 14, height: 14, style: { color: "#8E8EA9" } }),
        /* @__PURE__ */ jsx(Typography, { variant: "pi", textColor: "neutral500", children: "Auto-refresh 30s" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Box, { marginBottom: 5, children: /* @__PURE__ */ jsxs(Flex, { gap: 4, style: { flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 200px", minWidth: 180 }, children: /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Cn,
          label: "New Orders",
          value: data?.summary?.newOrders || 0,
          color: "success"
        }
      ) }),
      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 200px", minWidth: 180 }, children: /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: K2,
          label: "Total Orders",
          value: data?.summary?.totalOrders || 0,
          color: "primary"
        }
      ) }),
      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 200px", minWidth: 180 }, children: /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Ln,
          label: "Revenue",
          value: `$${data?.summary?.totalRevenue?.toFixed(2) || "0.00"}`,
          color: "warning"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxs(
      Box,
      {
        padding: 4,
        background: "neutral0",
        hasRadius: true,
        shadow: "filterShadow",
        marginBottom: 5,
        children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "Revenue & Orders" }),
            /* @__PURE__ */ jsx(Flex, { gap: 1, children: Object.keys(periodLabels).map((p) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handlePeriodChange(p),
                style: {
                  padding: "6px 12px",
                  borderRadius: 4,
                  border: "none",
                  backgroundColor: period === p ? "#4945FF" : "#F0F0FF",
                  color: period === p ? "#fff" : "#4945FF",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                },
                children: periodLabels[p]
              },
              p
            )) })
          ] }),
          /* @__PURE__ */ jsx(Box, { style: { width: "100%", height: 280, minWidth: 0 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(
            ComposedChart,
            {
              data: data?.revenueByDay || [],
              margin: { top: 10, right: 10, left: 0, bottom: 0 },
              children: [
                /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "colorRevenue", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#4945FF", stopOpacity: 0.3 }),
                  /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#4945FF", stopOpacity: 0 })
                ] }) }),
                /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#EAEAEF" }),
                /* @__PURE__ */ jsx(
                  XAxis,
                  {
                    dataKey: "date",
                    tick: { fontSize: 10 },
                    stroke: "#8E8EA9",
                    interval: period === "30d" ? 2 : period === "90d" ? 1 : 0,
                    angle: period === "30d" ? -45 : 0,
                    textAnchor: period === "30d" ? "end" : "middle",
                    height: period === "30d" ? 50 : 30
                  }
                ),
                /* @__PURE__ */ jsx(
                  YAxis,
                  {
                    yAxisId: "revenue",
                    tick: { fontSize: 11 },
                    stroke: "#8E8EA9",
                    tickFormatter: (v) => `$${v}`,
                    width: 55
                  }
                ),
                /* @__PURE__ */ jsx(
                  YAxis,
                  {
                    yAxisId: "orders",
                    orientation: "right",
                    tick: { fontSize: 11 },
                    stroke: "#0D882B",
                    width: 40
                  }
                ),
                /* @__PURE__ */ jsx(
                  Tooltip,
                  {
                    contentStyle: {
                      backgroundColor: "#fff",
                      border: "1px solid #EAEAEF",
                      borderRadius: 4,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      fontSize: 12
                    },
                    formatter: (value, name) => [
                      name === "revenue" ? `$${value.toFixed(2)}` : value,
                      name === "revenue" ? "Revenue" : "Orders"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Legend,
                  {
                    wrapperStyle: { fontSize: 11, paddingTop: 10 },
                    formatter: (value) => value === "revenue" ? "Revenue ($)" : "Orders"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Area,
                  {
                    yAxisId: "revenue",
                    type: "monotone",
                    dataKey: "revenue",
                    stroke: "#4945FF",
                    strokeWidth: 2,
                    fillOpacity: 1,
                    fill: "url(#colorRevenue)"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Line,
                  {
                    yAxisId: "orders",
                    type: "monotone",
                    dataKey: "orders",
                    stroke: "#0D882B",
                    strokeWidth: 2,
                    dot: { r: 4, fill: "#0D882B" },
                    activeDot: { r: 6, fill: "#0D882B" }
                  }
                )
              ]
            }
          ) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(Flex, { gap: 4, style: { flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 400px", minWidth: 320 }, children: /* @__PURE__ */ jsxs(
        Box,
        {
          padding: 4,
          background: "neutral0",
          hasRadius: true,
          shadow: "filterShadow",
          style: { height: "100%", minHeight: 350 },
          children: [
            /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
              /* @__PURE__ */ jsxs(Flex, { alignItems: "center", gap: 2, children: [
                /* @__PURE__ */ jsx(Typography, { variant: "delta", children: "New Orders" }),
                (data?.summary?.newOrders || 0) > 0 && /* @__PURE__ */ jsx(Badge, { active: true, children: data?.summary?.newOrders })
              ] }),
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: "/admin/content-manager/collection-types/api::lead.lead?filters[$and][0][orderStatus][$eq]=new&filters[$and][1][paymentStatus][$eq]=paid&sort=createdAt:DESC",
                  style: { fontSize: 12 },
                  children: "View all"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              Box,
              {
                style: {
                  maxHeight: 400,
                  overflowY: "auto",
                  overflowX: "hidden"
                },
                children: !data?.recentOrders?.length ? /* @__PURE__ */ jsxs(
                  Flex,
                  {
                    direction: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    style: { minHeight: 200 },
                    children: [
                      /* @__PURE__ */ jsx(Cn, { width: 40, height: 40, style: { opacity: 0.3, marginBottom: 12 } }),
                      /* @__PURE__ */ jsx(Typography, { textColor: "neutral500", children: "No new orders" })
                    ]
                  }
                ) : data.recentOrders.slice(0, 10).map((order) => /* @__PURE__ */ jsx(
                  OrderCard,
                  {
                    order,
                    onMarkSeen: markAsSeen
                  },
                  order.documentId
                ))
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(Box, { style: { flex: "1 1 300px", minWidth: 280 }, children: /* @__PURE__ */ jsxs(
        Box,
        {
          padding: 4,
          background: "neutral0",
          hasRadius: true,
          shadow: "filterShadow",
          style: { height: "100%", minHeight: 350 },
          children: [
            /* @__PURE__ */ jsx(Typography, { variant: "delta", marginBottom: 3, children: "Popular Events" }),
            /* @__PURE__ */ jsx(
              Box,
              {
                style: {
                  maxHeight: 400,
                  overflowY: "auto",
                  overflowX: "hidden"
                },
                children: !data?.eventStats?.length ? /* @__PURE__ */ jsxs(
                  Flex,
                  {
                    direction: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    style: { minHeight: 200 },
                    children: [
                      /* @__PURE__ */ jsx(K2, { width: 40, height: 40, style: { opacity: 0.3, marginBottom: 12 } }),
                      /* @__PURE__ */ jsx(Typography, { textColor: "neutral500", children: "No event data" })
                    ]
                  }
                ) : data.eventStats.slice(0, 10).map((stat, index) => /* @__PURE__ */ jsx(
                  EventBar,
                  {
                    stat,
                    maxCount: maxEventCount
                  },
                  stat.name + index
                ))
              }
            )
          ]
        }
      ) })
    ] })
  ] });
};
export {
  DashboardPage
};
