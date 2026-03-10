import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  Calendar,
  ArrowRight,
  Heart,
  Shield,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Prediction {
  id: number;
  created_at: string;
  risk_score: number;
  risk_level: string;
  bmi: number;
  gen_hlth: number;
}

interface DashboardStats {
  totalAssessments: number;
  lastAssessment: string | null;
  averageRisk: number;
  riskTrend: 'up' | 'down' | 'stable';
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    lastAssessment: null,
    averageRisk: 0,
    riskTrend: 'stable',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/predict/history?limit=5');
      const predictionData = response.data.predictions;
      setPredictions(predictionData);

      // Calculate stats
      if (predictionData.length > 0) {
        const total = response.data.total;
        const lastAssessment = predictionData[0]?.created_at;
        const avgRisk = predictionData.reduce((acc: number, p: Prediction) => acc + p.risk_score, 0) / predictionData.length;
        
        setStats({
          totalAssessments: total,
          lastAssessment: lastAssessment,
          averageRisk: avgRisk,
          riskTrend: avgRisk > 0.5 ? 'up' : 'down',
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low':
        return 'default';
      case 'moderate':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your health assessments
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          {
            title: 'Total Assessments',
            value: stats.totalAssessments,
            icon: Activity,
            color: 'bg-blue-500',
            trend: null,
          },
          {
            title: 'Average Risk Score',
            value: `${(stats.averageRisk * 100).toFixed(1)}%`,
            icon: TrendingUp,
            color: 'bg-purple-500',
            trend: stats.riskTrend,
          },
          {
            title: 'Last Assessment',
            value: stats.lastAssessment ? formatDate(stats.lastAssessment) : 'Never',
            icon: Calendar,
            color: 'bg-green-500',
            trend: null,
          },
          {
            title: 'Health Status',
            value: stats.averageRisk < 0.3 ? 'Good' : stats.averageRisk < 0.7 ? 'Fair' : 'At Risk',
            icon: Heart,
            color: stats.averageRisk < 0.3 ? 'bg-green-500' : stats.averageRisk < 0.7 ? 'bg-yellow-500' : 'bg-red-500',
            trend: null,
          },
        ].map((stat, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.trend && (
                      <div className={`flex items-center gap-1 mt-2 text-sm ${
                        stat.trend === 'down' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.trend === 'down' ? (
                          <TrendingUp className="w-4 h-4 rotate-180" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        <span>{stat.trend === 'down' ? 'Improving' : 'Increasing'}</span>
                      </div>
                    )}
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg shadow-gray-200/50 h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => navigate('/predict')}
                className="w-full h-14 bg-blue-900 hover:bg-blue-800 text-white rounded-xl justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span>New Assessment</span>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/history')}
                className="w-full h-14 border-gray-200 hover:bg-gray-50 rounded-xl justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>View History</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="w-full h-14 border-gray-200 hover:bg-gray-50 rounded-xl justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>Update Profile</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Assessments */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg shadow-gray-200/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Assessments
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                className="text-blue-900"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {predictions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-blue-900" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No assessments yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start your first diabetes risk assessment today
                  </p>
                  <Button
                    onClick={() => navigate('/predict')}
                    className="bg-blue-900 hover:bg-blue-800"
                  >
                    Start Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/history')}
                    >
                      <div className={`w-12 h-12 ${getRiskColor(prediction.risk_level)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        {prediction.risk_level === 'low' ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : prediction.risk_level === 'moderate' ? (
                          <AlertCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Heart className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            Risk Assessment
                          </p>
                          <Badge variant={getRiskBadgeVariant(prediction.risk_level)}>
                            {prediction.risk_level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(prediction.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            BMI: {prediction.bmi}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {(prediction.risk_score * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">Risk Score</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Health Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-0 shadow-lg shadow-gray-200/50 bg-gradient-to-r from-blue-900 to-blue-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  Stay on top of your health
                </h3>
                <p className="text-blue-100">
                  Regular assessments help track your diabetes risk over time. We recommend taking an assessment every 3 months.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/predict')}
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                Take Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
