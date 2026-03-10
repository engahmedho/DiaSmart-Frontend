import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Heart,
  User,
  Apple,
  Briefcase,
  RotateCcw,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PredictionResult {
  risk_score: number;
  risk_level: string;
  recommendation: string;
  risk_factors: string[];
}

const steps = [
  { id: 1, title: 'Basic Metrics', icon: User, description: 'Physical measurements' },
  { id: 2, title: 'Health Habits', icon: Apple, description: 'Lifestyle factors' },
  { id: 3, title: 'Medical History', icon: Activity, description: 'Health conditions' },
  { id: 4, title: 'Healthcare Access', icon: Briefcase, description: 'Socio-economic factors' },
];

const PredictionForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Form state for all 21 features
  const [formData, setFormData] = useState({
    // Step 1: Basic Metrics
    bmi: 25,
    age: 5,
    sex: 0,
    
    // Step 2: Health Habits
    smoker: 0,
    phys_activity: 1,
    fruits: 1,
    veggies: 1,
    hvy_alcohol_consump: 0,
    
    // Step 3: Medical History
    high_bp: 0,
    high_chol: 0,
    chol_check: 1,
    stroke: 0,
    heart_disease: 0,
    diff_walk: 0,
    
    // Step 4: Healthcare Access
    any_healthcare: 1,
    no_doc_bc_cost: 0,
    gen_hlth: 2,
    ment_hlth: 0,
    phys_hlth: 0,
    education: 4,
    income: 5,
  });

  const handleInputChange = (field: string, value: number) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/predict', formData);
      setResult(response.data);
      setShowResult(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Prediction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (score: number) => {
    if (score < 0.3) return 'bg-green-500';
    if (score < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Step 1: Basic Metrics
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Body Mass Index (BMI)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[formData.bmi]}
            onValueChange={(value) => handleInputChange('bmi', value[0])}
            min={10}
            max={70}
            step={0.1}
            className="flex-1"
          />
          <div className="w-20">
            <Input
              type="number"
              value={formData.bmi}
              onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value) || 0)}
              className="text-center"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {formData.bmi < 18.5 ? 'Underweight' : 
           formData.bmi < 25 ? 'Normal weight' : 
           formData.bmi < 30 ? 'Overweight' : 'Obese'}
        </p>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Age Category</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 1, label: '18-24' },
            { value: 2, label: '25-29' },
            { value: 3, label: '30-34' },
            { value: 4, label: '35-39' },
            { value: 5, label: '40-44' },
            { value: 6, label: '45-49' },
            { value: 7, label: '50-54' },
            { value: 8, label: '55-59' },
            { value: 9, label: '60-64' },
            { value: 10, label: '65-69' },
            { value: 11, label: '70-74' },
            { value: 12, label: '75-79' },
            { value: 13, label: '80+' },
          ].map((age) => (
            <button
              key={age.value}
              type="button"
              onClick={() => handleInputChange('age', age.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                formData.age === age.value
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {age.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Sex</Label>
        <div className="flex gap-4">
          {[
            { value: 0, label: 'Female' },
            { value: 1, label: 'Male' },
          ].map((sex) => (
            <button
              key={sex.value}
              type="button"
              onClick={() => handleInputChange('sex', sex.value)}
              className={`flex-1 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                formData.sex === sex.value
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {sex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Health Habits
  const renderStep2 = () => (
    <div className="space-y-6">
      {[
        { field: 'smoker', label: 'Have you smoked at least 100 cigarettes in your entire life?', description: 'About 5 packs total' },
        { field: 'phys_activity', label: 'Have you done physical activity in the past 30 days?', description: 'Exercise, running, walking, etc.' },
        { field: 'fruits', label: 'Do you consume fruit 1 or more times per day?', description: 'Fresh, frozen, or canned fruits' },
        { field: 'veggies', label: 'Do you consume vegetables 1 or more times per day?', description: 'Fresh, frozen, or canned vegetables' },
        { field: 'hvy_alcohol_consump', label: 'Do you have heavy alcohol consumption?', description: 'More than 14 drinks per week (men) or 7 (women)' },
      ].map((item) => (
        <div key={item.field} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex-1 pr-4">
            <Label className="text-gray-700 font-medium">{item.label}</Label>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </div>
          <Switch
            checked={formData[item.field as keyof typeof formData] === 1}
            onCheckedChange={(checked) => handleInputChange(item.field, checked ? 1 : 0)}
          />
        </div>
      ))}
    </div>
  );

  // Step 3: Medical History
  const renderStep3 = () => (
    <div className="space-y-6">
      {[
        { field: 'high_bp', label: 'High Blood Pressure', description: 'Have you been told you have high blood pressure?' },
        { field: 'high_chol', label: 'High Cholesterol', description: 'Have you been told you have high cholesterol?' },
        { field: 'chol_check', label: 'Cholesterol Check', description: 'Have you had your cholesterol checked in the past 5 years?' },
        { field: 'stroke', label: 'History of Stroke', description: 'Have you ever had a stroke?' },
        { field: 'heart_disease', label: 'Heart Disease', description: 'Have you ever had heart disease or a heart attack?' },
        { field: 'diff_walk', label: 'Difficulty Walking', description: 'Do you have difficulty walking or climbing stairs?' },
      ].map((item) => (
        <div key={item.field} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex-1 pr-4">
            <Label className="text-gray-700 font-medium">{item.label}</Label>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </div>
          <Switch
            checked={formData[item.field as keyof typeof formData] === 1}
            onCheckedChange={(checked) => handleInputChange(item.field, checked ? 1 : 0)}
          />
        </div>
      ))}
    </div>
  );

  // Step 4: Healthcare Access & Socio-Economic
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex-1 pr-4">
          <Label className="text-gray-700 font-medium">Healthcare Coverage</Label>
          <p className="text-sm text-gray-500 mt-1">Do you have any kind of health care coverage?</p>
        </div>
        <Switch
          checked={formData.any_healthcare === 1}
          onCheckedChange={(checked) => handleInputChange('any_healthcare', checked ? 1 : 0)}
        />
      </div>

      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex-1 pr-4">
          <Label className="text-gray-700 font-medium">Cost Barrier</Label>
          <p className="text-sm text-gray-500 mt-1">Was there a time in the past 12 months when you needed to see a doctor but could not because of cost?</p>
        </div>
        <Switch
          checked={formData.no_doc_bc_cost === 1}
          onCheckedChange={(checked) => handleInputChange('no_doc_bc_cost', checked ? 1 : 0)}
        />
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">General Health</Label>
        <p className="text-sm text-gray-500">How would you describe your general health?</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 1, label: 'Excellent', desc: 'Feel great most of the time' },
            { value: 2, label: 'Very Good', desc: 'Feel good with minor issues' },
            { value: 3, label: 'Good', desc: 'Generally okay' },
            { value: 4, label: 'Fair', desc: 'Have some health concerns' },
            { value: 5, label: 'Poor', desc: 'Struggling with health issues' },
          ].map((health) => (
            <button
              key={health.value}
              type="button"
              onClick={() => handleInputChange('gen_hlth', health.value)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                formData.gen_hlth === health.value
                  ? 'border-blue-900 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div>
                <p className={`font-medium ${formData.gen_hlth === health.value ? 'text-blue-900' : 'text-gray-700'}`}>
                  {health.label}
                </p>
                <p className="text-sm text-gray-500">{health.desc}</p>
              </div>
              {formData.gen_hlth === health.value && (
                <CheckCircle className="w-5 h-5 text-blue-900" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Poor Mental Health Days (Past 30 Days)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[formData.ment_hlth]}
            onValueChange={(value) => handleInputChange('ment_hlth', value[0])}
            min={0}
            max={30}
            step={1}
            className="flex-1"
          />
          <div className="w-20">
            <Input
              type="number"
              value={formData.ment_hlth}
              onChange={(e) => handleInputChange('ment_hlth', parseInt(e.target.value) || 0)}
              className="text-center"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">Number of days with stress, depression, or emotional problems</p>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Poor Physical Health Days (Past 30 Days)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[formData.phys_hlth]}
            onValueChange={(value) => handleInputChange('phys_hlth', value[0])}
            min={0}
            max={30}
            step={1}
            className="flex-1"
          />
          <div className="w-20">
            <Input
              type="number"
              value={formData.phys_hlth}
              onChange={(e) => handleInputChange('phys_hlth', parseInt(e.target.value) || 0)}
              className="text-center"
            />
          </div>
        </div>
        <p className="text-sm text-gray-500">Number of days with physical illness or injury</p>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Education Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 1, label: 'Never attended school' },
            { value: 2, label: 'Elementary' },
            { value: 3, label: 'Some high school' },
            { value: 4, label: 'High school graduate' },
            { value: 5, label: 'Some college' },
            { value: 6, label: 'College graduate' },
          ].map((edu) => (
            <button
              key={edu.value}
              type="button"
              onClick={() => handleInputChange('education', edu.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                formData.education === edu.value
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {edu.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-gray-700 font-medium">Income Level</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 1, label: 'Less than $10,000' },
            { value: 2, label: '$10,000 - $15,000' },
            { value: 3, label: '$15,000 - $20,000' },
            { value: 4, label: '$20,000 - $25,000' },
            { value: 5, label: '$25,000 - $35,000' },
            { value: 6, label: '$35,000 - $50,000' },
            { value: 7, label: '$50,000 - $75,000' },
            { value: 8, label: '$75,000 or more' },
          ].map((inc) => (
            <button
              key={inc.value}
              type="button"
              onClick={() => handleInputChange('income', inc.value)}
              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                formData.income === inc.value
                  ? 'border-blue-900 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {inc.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Diabetes Risk Assessment</h1>
        <p className="text-gray-500 mt-1">
          Complete this assessment to understand your diabetes risk factors
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex flex-col items-center ${
                  currentStep >= step.id ? 'cursor-pointer' : ''
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 4) * 100} className="h-2" />
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Form Card */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-0 shadow-xl shadow-gray-200/50">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between mt-8"
      >
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="h-12 px-6"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            className="h-12 px-6 bg-blue-900 hover:bg-blue-800"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 px-8 bg-blue-900 hover:bg-blue-800"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                Get Results
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}
      </motion.div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {result && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">Your Diabetes Risk Assessment</DialogTitle>
                <DialogDescription className="text-center">
                  Based on your responses, here's your personalized risk analysis
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Risk Score Gauge */}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={result.risk_score < 0.3 ? '#22c55e' : result.risk_score < 0.7 ? '#eab308' : '#ef4444'}
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${result.risk_score * 553} 553`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {(result.risk_score * 100).toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-500">Risk Score</span>
                    </div>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <div className="flex justify-center">
                  <Badge
                    className={`text-lg px-6 py-2 capitalize ${getRiskColor(result.risk_level)}`}
                  >
                    {result.risk_level} Risk
                  </Badge>
                </div>

                {/* Risk Factors */}
                {result.risk_factors.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Identified Risk Factors
                    </h4>
                    <ul className="space-y-2">
                      {result.risk_factors.map((factor, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-700">
                          <span className="w-2 h-2 bg-amber-500 rounded-full" />
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Personalized Recommendations
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{result.recommendation}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      setShowResult(false);
                      navigate('/history');
                    }}
                    className="flex-1 bg-blue-900 hover:bg-blue-800"
                  >
                    View History
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowResult(false);
                      setCurrentStep(1);
                    }}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PredictionForm;
