"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart, CartesianGrid } from "recharts"

type DashboardData = {
  userStats: {
    total: number;
  };
  financialStats: {
    totalRevenue: number;
    recentPayments: Array<{
      _id: string;
      amount: number;
      status: string;
      paymentDate?: string;
      createdAt: string;
      updatedAt: string;
      paymentMethod: string;
      merchantOrderId: string;
      transactionId: string;
      failureReason?: string;
      userId: {
        _id: string;
        email: string;
      };
    }>;
  };
}



interface OverviewProps {
  dashboardData: DashboardData | null;
}

type ChartDataType = {
  date: string;
  day: number;
  amount: number;
}

type StatusColorType = {
  main: string;
  gradient: Array<{
    offset: string;
    color: string;
    opacity: number;
  }>;
};

type StatusColorsType = {
  [key in 'success' | 'failed']: StatusColorType;
};





const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white px-3 py-2 rounded-md shadow-xl text-sm font-medium border-0">
        ₹{payload[0].value.toLocaleString("en-IN")}
      </div>
    )
  }
  return null
}

const statusColors: StatusColorsType = {
  success: {
    main: "#10B981",
    gradient: [
      { offset: "0%", color: "#10B981", opacity: 0.9 },
      { offset: "20%", color: "#34D399", opacity: 0.8 },
      { offset: "40%", color: "#6EE7B7", opacity: 0.6 },
      { offset: "60%", color: "#A7F3D0", opacity: 0.4 },
      { offset: "80%", color: "#D1FAE5", opacity: 0.2 },
      { offset: "100%", color: "#ECFDF5", opacity: 0.1 },
    ]
  },
  failed: {
    main: "#EF4444",
    gradient: [
      { offset: "0%", color: "#EF4444", opacity: 0.9 },
      { offset: "20%", color: "#F87171", opacity: 0.8 },
      { offset: "40%", color: "#FCA5A5", opacity: 0.6 },
      { offset: "60%", color: "#FECACA", opacity: 0.4 },
      { offset: "80%", color: "#FEE2E2", opacity: 0.2 },
      { offset: "100%", color: "#FEF2F2", opacity: 0.1 },
    ]
  },
};

const filterTabs = [
  { name: "success", color: "bg-green-500" },
  { name: "failed", color: "bg-red-500" },
];

const statusMapping: Record<string, keyof StatusColorsType> = {
  'success': 'success',
  'failed': 'failed',
  'failure': 'failed',
  'error': 'failed',
  'fail': 'failed'
};

export default function Overview({ dashboardData }: OverviewProps) {
  const [activeTab, setActiveTab] = useState<keyof StatusColorsType>("success")
  const [chartData, setChartData] = useState<Record<keyof StatusColorsType, ChartDataType[]>>({
    success: [],
    failed: []
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dashboardData?.financialStats.recentPayments) {
          const payments = dashboardData.financialStats.recentPayments;
          
          // Create a map to store payments by status and date
          const paymentsByStatus: Record<keyof StatusColorsType, Map<string, number>> = {
            success: new Map(),
            failed: new Map()
          };

          // Initialize last 14 days for each status
          const last14Days = Array.from({ length: 14 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          }).reverse();

          // Initialize all dates with 0 for each status
          Object.keys(paymentsByStatus).forEach(status => {
            last14Days.forEach(date => {
              paymentsByStatus[status as keyof StatusColorsType].set(date, 0);
            });
          });

          // Process payment logs for success and failed statuses
          payments.forEach(payment => {
            try {
              const dateToUse = payment.paymentDate || payment.createdAt;
              const paymentDate = dateToUse ? new Date(dateToUse) : null;
              
              if (paymentDate && !isNaN(paymentDate.getTime())) {
                const date = paymentDate.toISOString().split('T')[0];
                const apiStatus = payment.status.toLowerCase();
                const mappedStatus = statusMapping[apiStatus] || 'failed';

                if (paymentsByStatus[mappedStatus].has(date)) {
                  paymentsByStatus[mappedStatus].set(
                    date,
                    (paymentsByStatus[mappedStatus].get(date) || 0) + payment.amount
                  );
                }
              } else {
                console.warn('Payment has no valid date:', {
                  id: payment._id,
                  paymentDate: payment.paymentDate,
                  createdAt: payment.createdAt,
                  status: payment.status
                });
              }
            } catch (error) {
              console.error('Date parsing error:', {
                id: payment._id,
                paymentDate: payment.paymentDate,
                createdAt: payment.createdAt,
                status: payment.status,
                error
              });
              return;
            }
          });

          // Convert to chart format
          const newChartData: Record<keyof StatusColorsType, ChartDataType[]> = {
            success: [],
            failed: []
          };

          Object.entries(paymentsByStatus).forEach(([status, dateMap]) => {
            const statusData = Array.from(dateMap.entries()).map(([date, amount], index) => ({
              date: date.split('-')[2], // Just use the day
              day: index + 1,
              amount: amount
            }));
            newChartData[status as keyof StatusColorsType] = statusData;
          });

          setChartData(newChartData);
        }
      } catch (error) {
        console.error('Failed to fetch or process data:', error);
      }
    };

    fetchData();
  }, [dashboardData]);

  // Get min and max values for Y-axis based on all data
  const allValues = Object.values(chartData).flatMap(data => data.map(item => item.amount));
  const minAmount = Math.floor(Math.min(...allValues, 0) * 0.9);
  const maxAmount = Math.ceil(Math.max(...allValues, 1) * 1.1);

  // Calculate ticks for Y-axis
  const tickCount = 5;
  const tickSize = Math.ceil((maxAmount - minAmount) / (tickCount - 1));
  const yAxisTicks = Array.from({ length: tickCount }, (_, i) => minAmount + (tickSize * i));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        </div>
        <Select defaultValue="overall">
          <SelectTrigger className="w-40 rounded-lg border-gray-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overall">Overall</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
              <p className="text-4xl font-bold text-gray-900">₹{dashboardData?.financialStats.totalRevenue || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-2xl border-0 shadow-sm bg-white">
          <CardContent className="p-0">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Active & Paid Users</p>
              <p className="text-4xl font-bold text-gray-900">{dashboardData?.userStats.total || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="rounded-2xl border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          {/* Chart Controls */}
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Payment Status</span>
              <div className="flex items-center space-x-4">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name as keyof StatusColorsType)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.name 
                        ? `${tab.name === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white` 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${tab.color}`}></div>
                    <span>{tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-90 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData[activeTab]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  {Object.entries(statusColors).map(([status, colors]) => (
                    <linearGradient key={status} id={`areaGradient${status}`} x1="0" y1="0" x2="0" y2="1">
                      {colors.gradient.map((stop) => (
                        <stop
                          key={stop.offset}
                          offset={stop.offset}
                          stopColor={stop.color}
                          stopOpacity={stop.opacity}
                        />
                      ))}
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  horizontal={true}
                  vertical={true}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  height={40}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  tickFormatter={(value) => `₹${value}`}
                  domain={[minAmount, maxAmount]}
                  ticks={yAxisTicks}
                  width={80}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: statusColors[activeTab].main, strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={statusColors[activeTab].main}
                  strokeWidth={3}
                  fill={`url(#areaGradient${activeTab})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: statusColors[activeTab].main,
                    strokeWidth: 3,
                    stroke: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 