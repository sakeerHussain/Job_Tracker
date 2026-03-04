import { useState, useEffect } from "react";
import { Loader, TrendingUp, Target, Award, XCircle } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import PageLayout from "../components/layout/PageLayout.jsx";
import { fetchJobs, fetchAnalytics } from "../api/jobApi.js";

// Colors for pie chart slices
const PIE_COLORS = {
  Applied:   "#3b82f6",
  Interview: "#f59e0b",
  Offer:     "#10b981",
  Rejected:  "#ef4444",
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, jobsRes] = await Promise.all([
          fetchAnalytics(),
          fetchJobs(),
        ]);
        setAnalytics(analyticsRes.data.data);
        setJobs(jobsRes.data.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </PageLayout>
    );
  }

  if (!analytics || jobs.length === 0) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <TrendingUp className="text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Add some job applications to see your analytics
          </p>
        </div>
      </PageLayout>
    );
  }

  // ── Pie chart data ───────────────────────────────────────
  const pieData = Object.entries(analytics.stats)
    .filter(([, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  // ── Bar chart — applications per week ───────────────────
  const weeklyMap = {};
  jobs.forEach((job) => {
    const date = new Date(job.appliedDate);
    const week = `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleString("default", { month: "short" })}`;
    weeklyMap[week] = (weeklyMap[week] || 0) + 1;
  });
  const weeklyData = Object.entries(weeklyMap)
    .slice(-8)
    .map(([week, count]) => ({ week, Applications: count }));

  // ── Line chart — cumulative applications over time ───────
  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate)
  );
  let cumulative = 0;
  const cumulativeData = sortedJobs.map((job) => {
    cumulative += 1;
    return {
      date: new Date(job.appliedDate).toLocaleDateString("default", {
        month: "short", day: "numeric",
      }),
      Total: cumulative,
    };
  });

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Insights into your job search performance
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Applied"
          value={analytics.total}
          icon={TrendingUp}
          color="bg-blue-500"
          sub="All time"
        />
        <StatCard
          label="Interviews"
          value={analytics.stats.Interview}
          icon={Target}
          color="bg-yellow-500"
          sub={`${analytics.total > 0 ? Math.round((analytics.stats.Interview / analytics.total) * 100) : 0}% of applications`}
        />
        <StatCard
          label="Offers"
          value={analytics.stats.Offer}
          icon={Award}
          color="bg-green-500"
          sub={`${analytics.total > 0 ? Math.round((analytics.stats.Offer / analytics.total) * 100) : 0}% success rate`}
        />
        <StatCard
          label="Rejected"
          value={analytics.stats.Rejected}
          icon={XCircle}
          color="bg-red-500"
          sub={`${analytics.total > 0 ? Math.round((analytics.stats.Rejected / analytics.total) * 100) : 0}% of applications`}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Pie Chart — Status Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Application Status Breakdown
          </h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PIE_COLORS[entry.name]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="space-y-2 min-w-fit">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[entry.name] }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                  <span className="text-sm font-semibold text-gray-800 ml-auto pl-4">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart — Weekly Applications */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Applications Per Week
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
              />
              <Bar dataKey="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Cumulative Applications Over Time
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
            />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </PageLayout>
  );
};

export default Analytics;