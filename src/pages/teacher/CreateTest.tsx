import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  FileText, 
  Clock, 
  Target, 
  Upload, 
  Sparkles, 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import apiService from '@/services/apiService';

interface TestFormData {
  title: string;
  description: string;
  topic: string;
  duration: number;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questionTypes: string[];
  sourceContent?: string;
}

const CreateTest: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TestFormData>({
    title: '',
    description: '',
    topic: '',
    duration: 30,
    questionCount: 10,
    difficulty: 'medium',
    questionTypes: ['mcq'],
    sourceContent: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTest, setGeneratedTest] = useState(null);
  
  const navigate = useNavigate();

  const handleInputChange = (field: keyof TestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleQuestionType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const generateTest = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiService.createTest(formData);
      setGeneratedTest(response.test);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const publishTest = async () => {
    if (!generatedTest) return;

    setLoading(true);
    try {
      await apiService.publishTest((generatedTest as any)._id);
      navigate('/teacher/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to publish test.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card className="glass shadow-elevation">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span>Test Details</span>
        </CardTitle>
        <CardDescription>
          Configure the basic settings for your AI-generated test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Test Title</Label>
            <Input
              id="title"
              placeholder="e.g., Mathematics Quiz"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., Algebra Basics"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="glass"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of what this test covers..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="glass"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Number of Questions</Label>
            <Select value={formData.questionCount.toString()} onValueChange={(value) => handleInputChange('questionCount', parseInt(value))}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
                <SelectItem value="20">20 questions</SelectItem>
                <SelectItem value="25">25 questions</SelectItem>
                <SelectItem value="50">50 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={formData.difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => handleInputChange('difficulty', value)}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Question Types</Label>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'mcq', label: 'Multiple Choice', icon: Target },
              { value: 'fill_in_blank', label: 'Fill in the Blank', icon: FileText },
              { value: 'true_false', label: 'True/False', icon: CheckCircle },
            ].map(({ value, label, icon: Icon }) => (
              <div
                key={value}
                onClick={() => toggleQuestionType(value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border cursor-pointer transition-all hover-glow ${
                  formData.questionTypes.includes(value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="glass shadow-elevation">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-neural rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-white" />
          </div>
          <span>Content Source (Optional)</span>
        </CardTitle>
        <CardDescription>
          Provide source material to generate more specific questions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sourceContent">Source Content</Label>
          <Textarea
            id="sourceContent"
            placeholder="Paste your lesson content, textbook excerpts, or study materials here..."
            value={formData.sourceContent}
            onChange={(e) => handleInputChange('sourceContent', e.target.value)}
            className="glass min-h-[200px]"
            rows={8}
          />
          <p className="text-sm text-muted-foreground">
            The AI will use this content to generate more targeted questions. Leave empty for general topic-based questions.
          </p>
        </div>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Files (Coming Soon)</h3>
          <p className="text-muted-foreground">
            Upload PDFs, documents, or other study materials for AI analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="glass shadow-elevation">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-success rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <span>Test Generated Successfully!</span>
        </CardTitle>
        <CardDescription>
          Your AI-powered test is ready. Review and publish when you're satisfied.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {generatedTest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-card-secondary rounded-lg">
                <p className="text-2xl font-bold text-primary">{(generatedTest as any).questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center p-4 bg-card-secondary rounded-lg">
                <p className="text-2xl font-bold text-success">{(generatedTest as any).settings.totalMarks}</p>
                <p className="text-sm text-muted-foreground">Total Marks</p>
              </div>
              <div className="text-center p-4 bg-card-secondary rounded-lg">
                <p className="text-2xl font-bold text-warning">{(generatedTest as any).settings.duration}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
              <div className="text-center p-4 bg-card-secondary rounded-lg">
                <p className="text-2xl font-bold text-info">{(generatedTest as any).accessControl.accessCode}</p>
                <p className="text-sm text-muted-foreground">Access Code</p>
              </div>
            </div>

            <div className="bg-card-secondary rounded-lg p-4">
              <h4 className="font-medium mb-2">Share URL</h4>
              <p className="text-sm text-muted-foreground font-mono bg-background px-3 py-2 rounded">
                {window.location.origin}/test/{(generatedTest as any)._id}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="animate-fade-in">
              <h1 className="text-3xl font-bold text-gradient-ai">Create AI Test</h1>
              <p className="text-muted-foreground mt-2">
                Generate intelligent tests powered by artificial intelligence
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/teacher/dashboard')}
              className="glass"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                    step >= stepNumber
                      ? 'bg-gradient-ai text-white'
                      : 'bg-card border border-border text-muted-foreground'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all ${
                      step > stepNumber ? 'bg-primary' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <div className="animate-fade-in">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || loading}
              className="glass"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 2) {
                    generateTest();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={loading || !formData.title || !formData.topic}
                className="bg-gradient-ai hover:bg-gradient-neural group"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : step === 2 ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Test
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={publishTest}
                disabled={loading}
                className="bg-gradient-success hover:bg-gradient-success/90 group"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Publish Test
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTest;