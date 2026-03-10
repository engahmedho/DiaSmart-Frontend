import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Users,
  TrendingUp,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';

interface DashboardStats {
  total_screenings: number;
  risk_rate_percentage: number;
  active_users: number;
  system_uptime: string;
}

interface DailyScreening {
  date: string;
  count: number;
}

interface DemographicData {
  label: string;
  count: number;
  percentage: number;
}

interface Demographics {
  age_distribution: DemographicData[];
  gender_distribution: DemographicData[];
}

interface AuditLog {
  id: number;
  user_email: string | null;
  action: string;
  details: string | null;
  ip_address: string | null;
  timestamp: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyScreenings, setDailyScreenings] = useState<DailyScreening[]>([]);
  const [demographics, setDemographics] = useState<Demographics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const logPageSize = 10;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [logPage, searchQuery]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/admin/dashboard/analytics?days=30');
      setStats(response.data.stats);
      setDailyScreenings(response.data.daily_screenings);
      setDemographics(response.data.demographics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        `/admin/audit-logs?page=${logPage}&page_size=${logPageSize}&search=${searchQuery}`
      );
      setAuditLogs(response.data.logs);
      setLogTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-700';
      case 'signup':
        return 'bg-blue-100 text-blue-700';
      case 'prediction':
        return 'bg-purple-100 text-purple-700';
      case 'logout':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  const totalLogPages = Math.ceil(logTotal / logPageSize);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              System overview and analytics
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Screenings</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.total_screenings.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Risk Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.risk_rate_percentage}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.active_users.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">System Uptime</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats?.system_uptime}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Screenings Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Daily Screenings (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <ResponsiveContainer width="100%" height={256}>
                  <LineChart data={dailyScreenings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#1E3A8A"
                      strokeWidth={2}
                      dot={{ fill: '#1E3A8A', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Demographics Charts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 gap-8"
        >
          {/* Age Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Age Distribution (High Risk)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48" />
              ) : (
                <ResponsiveContainer width="100%" height={192}>
                  <BarChart data={demographics?.age_distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Gender Distribution (High Risk)</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : (
                <ResponsiveContainer width="100%" height={192}>
                  <PieChart>
                    <Pie
                      data={demographics?.gender_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {(demographics?.gender_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Audit Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Audit Logs</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Details</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">IP Address</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {log.user_email || 'System'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`capitalize ${getActionColor(log.action)}`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 truncate max-w-xs block">
                          {log.details || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {log.ip_address || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(log.timestamp)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalLogPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((logPage - 1) * logPageSize) + 1} to {Math.min(logPage * logPageSize, logTotal)} of {logTotal} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogPage(logPage - 1)}
                    disabled={logPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLogPage(logPage + 1)}
                    disabled={logPage === totalLogPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
