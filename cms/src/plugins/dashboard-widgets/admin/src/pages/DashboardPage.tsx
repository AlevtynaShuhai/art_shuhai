import { useEffect, useState } from 'react';
import { Box, Flex, Typography, Grid, Loader, Link, Badge, Button } from '@strapi/design-system';
import { ShoppingCart, Store, Calendar, User, Clock, Check } from '@strapi/icons';
import { useFetchClient } from '@strapi/strapi/admin';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PLUGIN_ID } from '../pluginId';

interface Lead {
  id: number;
  documentId: string;
  name: string;
  email: string;
  eventName: string;
  eventDate: string;
  amountPaid: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  paidAt?: string;
  orderDate: string;
}

interface EventStat {
  name: string;
  count: number;
  revenue: number;
}

interface RevenueDay {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardData {
  summary: {
    newOrders: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders: Lead[];
  eventStats: EventStat[];
  revenueByDay: RevenueDay[];
}

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: '#C6F0C2', color: '#0D882B', label: 'Paid' },
    pending: { bg: '#FEE2B3', color: '#BE5D01', label: 'Pending' },
    failed: { bg: '#F5C0B8', color: '#B72B1A', label: 'Failed' },
    refunded: { bg: '#D9D8FF', color: '#4945FF', label: 'Refunded' },
  };
  const { bg, color, label } = config[status] || config.pending;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 8px',
      borderRadius: 4,
      backgroundColor: bg,
      color: color,
      fontSize: 11,
      fontWeight: 600,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: color,
      }} />
      {label}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color = 'primary'
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: 'primary' | 'success' | 'warning'
}) => {
  const colorMap = {
    primary: { bg: 'primary100', iconBg: 'primary200', text: 'primary700' },
    success: { bg: 'success100', iconBg: 'success200', text: 'success700' },
    warning: { bg: 'warning100', iconBg: 'warning200', text: 'warning700' },
  };
  const colors = colorMap[color];

  return (
    <Box
      padding={5}
      background={colors.bg}
      hasRadius
      shadow="filterShadow"
      style={{ minWidth: 0 }}
    >
      <Flex gap={4} alignItems="center">
        <Box
          padding={3}
          background={colors.iconBg}
          hasRadius
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon width={24} height={24} />
        </Box>
        <Box style={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant="pi"
            textColor="neutral600"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: 11,
              marginBottom: 4,
              display: 'block',
            }}
          >
            {label}
          </Typography>
          <Typography variant="alpha" textColor={colors.text}>
            {value}
          </Typography>
        </Box>
      </Flex>
    </Box>
  );
};

// Format date for display
const formatOrderDate = (dateStr: string): string => {
  if (!dateStr) return 'No date';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Order card component for better readability
const OrderCard = ({
  order,
  onMarkSeen
}: {
  order: Lead;
  onMarkSeen: (id: string) => void;
}) => {
  const truncate = (str: string, max: number) =>
    str && str.length > max ? str.slice(0, max) + '...' : str;

  return (
    <Box
      padding={3}
      background="neutral0"
      hasRadius
      style={{
        border: '1px solid #EAEAEF',
        marginBottom: 8,
      }}
    >
      <Flex justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Flex alignItems="flex-start" gap={3} style={{ minWidth: 0, flex: 1 }}>
          <Box
            background="success100"
            hasRadius
            padding={2}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <User width={16} height={16} />
            <span style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#0D882B',
              border: '2px solid white',
            }} />
          </Box>
          <Box style={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="omega"
              fontWeight="bold"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: '100%',
              }}
              title={order.name}
            >
              {truncate(order.name, 25)}
            </Typography>
            <Typography
              variant="pi"
              textColor="neutral500"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                maxWidth: '100%',
              }}
              title={order.email}
            >
              {truncate(order.email, 30)}
            </Typography>
            <Flex alignItems="center" gap={2} marginTop={1} style={{ flexWrap: 'wrap' }}>
              <Typography
                variant="pi"
                textColor="neutral700"
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 150,
                }}
                title={order.eventName}
              >
                {truncate(order.eventName, 20)}
              </Typography>
              <Typography variant="pi" textColor="neutral400">|</Typography>
              <Typography variant="pi" textColor="primary600" fontWeight="semiBold">
                {formatOrderDate(order.orderDate)}
              </Typography>
            </Flex>
          </Box>
        </Flex>
        <Flex direction="column" alignItems="flex-end" gap={2} style={{ flexShrink: 0 }}>
          <Typography variant="omega" textColor="success600" fontWeight="bold">
            ${order.amountPaid?.toFixed(2) || '0.00'}
          </Typography>
          <PaymentStatusBadge status={order.paymentStatus} />
          <Button
            onClick={() => onMarkSeen(order.documentId)}
            variant="success-light"
            size="S"
            startIcon={<Check width={12} height={12} />}
            style={{ marginTop: 4 }}
          >
            Mark seen
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

// Horizontal bar for event stats - better for long names
const EventBar = ({ stat, maxCount }: { stat: EventStat; maxCount: number }) => {
  const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;

  const truncate = (str: string, max: number) =>
    str && str.length > max ? str.slice(0, max) + '...' : str;

  return (
    <Box style={{ marginBottom: 12 }}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={1}>
        <Typography
          variant="pi"
          textColor="neutral800"
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '60%',
          }}
          title={stat.name}
        >
          {truncate(stat.name, 30)}
        </Typography>
        <Flex alignItems="center" gap={2}>
          <Typography variant="pi" fontWeight="bold" textColor="primary600">
            {stat.count}
          </Typography>
          <Typography variant="pi" textColor="neutral500">
            (${stat.revenue.toFixed(0)})
          </Typography>
        </Flex>
      </Flex>
      <Box
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#EAEAEF',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: '#4945FF',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Box>
  );
};

type Period = '7d' | '30d' | '90d' | '1y' | 'all';

const periodLabels: Record<Period, string> = {
  '7d': '7 Days',
  '30d': 'Month',
  '90d': 'Quarter',
  '1y': 'Year',
  'all': 'All Time',
};

const DashboardPage = () => {
  const { get, post } = useFetchClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('7d');

  const fetchData = async (selectedPeriod: Period = period) => {
    try {
      setLoading(true);
      const response = await get(`/${PLUGIN_ID}/stats?period=${selectedPeriod}`);
      setData(response.data?.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    fetchData(newPeriod);
  };

  const markAsSeen = async (documentId: string) => {
    try {
      await post(`/${PLUGIN_ID}/mark-seen/${documentId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to mark as seen:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <Box padding={6} background="neutral100" style={{ minHeight: '100vh' }}>
        <Flex justifyContent="center" alignItems="center" style={{ minHeight: '400px' }}>
          <Loader />
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box padding={6} background="neutral100">
        <Box padding={4} background="danger100" hasRadius>
          <Typography textColor="danger600">{error}</Typography>
        </Box>
      </Box>
    );
  }

  const maxEventCount = Math.max(...(data?.eventStats?.map(s => s.count) || [1]));

  return (
    <Box padding={6} background="neutral100" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom={5}>
        <Typography variant="alpha">Dashboard</Typography>
        <Flex alignItems="center" gap={2}>
          <Clock width={14} height={14} style={{ color: '#8E8EA9' }} />
          <Typography variant="pi" textColor="neutral500">
            Auto-refresh 30s
          </Typography>
        </Flex>
      </Flex>

      {/* Summary Cards */}
      <Box marginBottom={5}>
        <Flex gap={4} style={{ flexWrap: 'wrap' }}>
          <Box style={{ flex: '1 1 200px', minWidth: 180 }}>
            <StatCard
              icon={ShoppingCart}
              label="New Orders"
              value={data?.summary?.newOrders || 0}
              color="success"
            />
          </Box>
          <Box style={{ flex: '1 1 200px', minWidth: 180 }}>
            <StatCard
              icon={Calendar}
              label="Total Orders"
              value={data?.summary?.totalOrders || 0}
              color="primary"
            />
          </Box>
          <Box style={{ flex: '1 1 200px', minWidth: 180 }}>
            <StatCard
              icon={Store}
              label="Revenue"
              value={`$${data?.summary?.totalRevenue?.toFixed(2) || '0.00'}`}
              color="warning"
            />
          </Box>
        </Flex>
      </Box>

      {/* Revenue Chart */}
      <Box
        padding={4}
        background="neutral0"
        hasRadius
        shadow="filterShadow"
        marginBottom={5}
      >
        <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
          <Typography variant="delta">
            Revenue & Orders
          </Typography>
          <Flex gap={1}>
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: period === p ? '#4945FF' : '#F0F0FF',
                  color: period === p ? '#fff' : '#4945FF',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {periodLabels[p]}
              </button>
            ))}
          </Flex>
        </Flex>
        <Box style={{ width: '100%', height: 280, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data?.revenueByDay || []}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4945FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4945FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEF" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                stroke="#8E8EA9"
                interval={period === '30d' ? 2 : period === '90d' ? 1 : 0}
                angle={period === '30d' ? -45 : 0}
                textAnchor={period === '30d' ? 'end' : 'middle'}
                height={period === '30d' ? 50 : 30}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11 }}
                stroke="#8E8EA9"
                tickFormatter={(v) => `$${v}`}
                width={55}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 11 }}
                stroke="#0D882B"
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #EAEAEF',
                  borderRadius: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `$${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                formatter={(value) => value === 'revenue' ? 'Revenue ($)' : 'Orders'}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#4945FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Line
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="#0D882B"
                strokeWidth={2}
                dot={{ r: 4, fill: '#0D882B' }}
                activeDot={{ r: 6, fill: '#0D882B' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Two Column Layout */}
      <Flex gap={4} style={{ flexWrap: 'wrap' }}>
        {/* Recent Orders */}
        <Box style={{ flex: '1 1 400px', minWidth: 320 }}>
          <Box
            padding={4}
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            style={{ height: '100%', minHeight: 350 }}
          >
            <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
              <Flex alignItems="center" gap={2}>
                <Typography variant="delta">New Orders</Typography>
                {(data?.summary?.newOrders || 0) > 0 && (
                  <Badge active>{data?.summary?.newOrders}</Badge>
                )}
              </Flex>
              <Link
                href="/admin/content-manager/collection-types/api::lead.lead?filters[$and][0][orderStatus][$eq]=new&filters[$and][1][paymentStatus][$eq]=paid&sort=createdAt:DESC"
                style={{ fontSize: 12 }}
              >
                View all
              </Link>
            </Flex>

            <Box
              style={{
                maxHeight: 400,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {!data?.recentOrders?.length ? (
                <Flex
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  padding={6}
                  style={{ minHeight: 200 }}
                >
                  <ShoppingCart width={40} height={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <Typography textColor="neutral500">No new orders</Typography>
                </Flex>
              ) : (
                data.recentOrders.slice(0, 10).map((order) => (
                  <OrderCard
                    key={order.documentId}
                    order={order}
                    onMarkSeen={markAsSeen}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* Events Distribution - Horizontal Bars */}
        <Box style={{ flex: '1 1 300px', minWidth: 280 }}>
          <Box
            padding={4}
            background="neutral0"
            hasRadius
            shadow="filterShadow"
            style={{ height: '100%', minHeight: 350 }}
          >
            <Typography variant="delta" marginBottom={3}>
              Popular Events
            </Typography>

            <Box
              style={{
                maxHeight: 400,
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              {!data?.eventStats?.length ? (
                <Flex
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  padding={6}
                  style={{ minHeight: 200 }}
                >
                  <Calendar width={40} height={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                  <Typography textColor="neutral500">No event data</Typography>
                </Flex>
              ) : (
                data.eventStats.slice(0, 10).map((stat, index) => (
                  <EventBar
                    key={stat.name + index}
                    stat={stat}
                    maxCount={maxEventCount}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export { DashboardPage };
