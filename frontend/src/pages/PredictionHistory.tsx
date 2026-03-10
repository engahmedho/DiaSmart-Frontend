import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle,
  Heart
} from 'lucide-react';

interface Prediction {
  id: number;
  created_at: string;
  risk_score: number;
  risk_level: string;
  recommendation: string;
  bmi: number;
  age_category: number;
  gen_hlth: number;
  high_bp: number;
  high_chol: number;
  smoker: number;
  phys_activity: number;
}

const PredictionHistory: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchPredictions();
  }, [page]);

  const fetchPredictions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/predict/history?limit=${pageSize}&offset=${(page - 1) * pageSize}`);
      setPredictions(response.data.predictions);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching predictions:', error);
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

  const getTrendIcon = (current: number, previous: number | null) => {
    if (!previous) return <Minus className="w-4 h-4 text-gray-400" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-green-500" />;
    if (current > previous) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
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

  const getAgeLabel = (category: number) => {
    const ages: { [key: number]: string } = {
      1: '18-24', 2: '25-29', 3: '30-34', 4: '35-39', 5: '40-44',
      6: '45-49', 7: '50-54', 8: '55-59', 9: '60-64', 10: '65-69',
      11: '70-74', 12: '75-79', 13: '80+'
    };
    return ages[category] || 'Unknown';
  };

  const getHealthLabel = (health: number) => {
    const healths: { [key: number]: string } = {
      1: 'Excellent', 2: 'Very Good', 3: 'Good', 4: 'Fair', 5: 'Poor'
    };
    return healths[health] || 'Unknown';
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Assessment History</h1>
        <p className="text-gray-500 mt-1">
          View all your previous diabetes risk assessments
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Assessments</p>
            <p className="text-2xl font-bold text-gray-900">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Latest Risk</p>
            <p className="text-2xl font-bold text-gray-900">
              {predictions[0] ? `${(predictions[0].risk_score * 100).toFixed(0)}%` : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Average Risk</p>
            <p className="text-2xl font-bold text-gray-900">
              {predictions.length > 0
                ? `${(
                    predictions.reduce((acc, p) => acc + p.risk_score, 0) /
                    predictions.length *
                    100
                  ).toFixed(0)}%`
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Trend</p>
            <div className="flex items-center gap-2">
              {predictions.length > 1 ? (
                <>
                  {getTrendIcon(predictions[0].risk_score, predictions[1].risk_score)}
                  <span className="text-lg font-medium">
                    {predictions[0].risk_score < predictions[1].risk_score
                      ? 'Improving'
                      : predictions[0].risk_score > predictions[1].risk_score
                      ? 'Increasing'
                      : 'Stable'}
                  </span>
                </>
              ) : (
                <span className="text-gray-400">Not enough data</span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Predictions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : predictions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No assessments yet
                </h3>
                <p className="text-gray-500">
                  Take your first diabetes risk assessment to see it here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={prediction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Risk Indicator */}
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 ${getRiskColor(prediction.risk_level)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          {prediction.risk_level === 'low' ? (
                            <CheckCircle className="w-7 h-7 text-white" />
                          ) : prediction.risk_level === 'moderate' ? (
                            <AlertCircle className="w-7 h-7 text-white" />
                          ) : (
                            <Heart className="w-7 h-7 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRiskBadgeVariant(prediction.risk_level)} className="capitalize">
                              {prediction.risk_level} Risk
                            </Badge>
                            {index > 0 && getTrendIcon(prediction.risk_score, predictions[index - 1]?.risk_score)}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mt-1">
                            {(prediction.risk_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(prediction.created_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">BMI</p>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {prediction.bmi}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="text-sm font-medium text-gray-900">
                            {getAgeLabel(prediction.age_category)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Health</p>
                          <p className="text-sm font-medium text-gray-900">
                            {getHealthLabel(prediction.gen_hlth)}
                          </p>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="flex flex-wrap gap-2">
                        {prediction.high_bp === 1 && (
                          <Badge variant="outline" className="text-xs">High BP</Badge>
                        )}
                        {prediction.high_chol === 1 && (
                          <Badge variant="outline" className="text-xs">High Chol</Badge>
                        )}
                        {prediction.smoker === 1 && (
                          <Badge variant="outline" className="text-xs">Smoker</Badge>
                        )}
                        {prediction.phys_activity === 0 && (
                          <Badge variant="outline" className="text-xs">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
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

export default PredictionHistory;
