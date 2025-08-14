import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Send,
  Save,
  BookOpen
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface Question {
  _id: string;
  type: 'mcq' | 'fill_in_blank';
  question: string;
  options?: { text: string }[];
  points: number;
}

interface TestData {
  questions: Question[];
  duration: number;
  totalMarks: number;
  title: string;
}

const TakeTest: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [submissionId, setSubmissionId] = useState<string>('');
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout>();
  const autoSaveRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (testId) {
      startTest();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [testId]);

  useEffect(() => {
    // Auto-save every 30 seconds
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      if (submissionId && testData) {
        autoSaveAnswers();
      }
    }, 30000);
  }, [answers, submissionId]);

  const startTest = async () => {
    try {
      setLoading(true);
      const response = await apiService.startTest(testId!);
      
      setSubmissionId(response.submissionId);
      setTestData({
        questions: response.questions,
        duration: response.duration,
        totalMarks: response.totalMarks,
        title: response.title || 'Test'
      });
      setTimeLeft(response.duration * 60); // Convert minutes to seconds
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start test',
        variant: 'destructive'
      });
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const autoSaveAnswers = async () => {
    if (!submissionId || !testData) return;
    
    try {
      setAutoSaving(true);
      const currentQuestionData = testData.questions[currentQuestion];
      const answer = answers[currentQuestionData._id];
      
      if (answer !== undefined) {
        await apiService.saveAnswer(submissionId, currentQuestionData._id, {
          selectedOption: currentQuestionData.type === 'mcq' ? answer : undefined,
          textAnswer: currentQuestionData.type === 'fill_in_blank' ? answer : undefined,
          timeSpent: 30
        });
      }
    } catch (error) {
      console.warn('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < testData!.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!submissionId) return;
    
    try {
      setSubmitting(true);
      
      // Save current answer before submitting
      if (testData) {
        const currentQuestionData = testData.questions[currentQuestion];
        const answer = answers[currentQuestionData._id];
        
        if (answer !== undefined) {
          await apiService.saveAnswer(submissionId, currentQuestionData._id, {
            selectedOption: currentQuestionData.type === 'mcq' ? answer : undefined,
            textAnswer: currentQuestionData.type === 'fill_in_blank' ? answer : undefined,
            timeSpent: 30
          });
        }
      }
      
      const response = await apiService.submitTest(submissionId);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      toast({
        title: autoSubmit ? 'Time Up!' : 'Success',
        description: autoSubmit ? 'Test auto-submitted' : 'Test submitted successfully'
      });
      
      navigate(`/results/${submissionId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit test',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return 'text-destructive'; // Last 5 minutes
    if (timeLeft <= 600) return 'text-warning'; // Last 10 minutes
    return 'text-foreground';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
            <p className="text-muted-foreground mb-4">The test you're looking for doesn't exist or has expired.</p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = testData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / testData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Card className="glass shadow-elevation">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{testData.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {testData.questions.length}
                  </p>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="glass">
                      {answeredCount}/{testData.questions.length} Answered
                    </Badge>
                    {autoSaving && (
                      <Badge variant="outline" className="bg-info/10 text-info border-info/30">
                        <Save className="w-3 h-3 mr-1" />
                        Saving...
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-5 h-5 ${getTimeColor()}`} />
                    <span className={`text-lg font-mono ${getTimeColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Warning */}
        {timeLeft <= 300 && timeLeft > 0 && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              Less than 5 minutes remaining! Make sure to submit your test.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card className="glass shadow-elevation animate-scale-in">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {currentQuestionData.question}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2 mt-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{currentQuestionData.points} point{currentQuestionData.points !== 1 ? 's' : ''}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestionData.type === 'mcq' ? (
              <RadioGroup
                value={answers[currentQuestionData._id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestionData._id, value)}
                className="space-y-3"
              >
                {currentQuestionData.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-card-secondary transition-colors">
                    <RadioGroupItem value={option.text} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="answer">Your Answer</Label>
                <Input
                  id="answer"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestionData._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionData._id, e.target.value)}
                  className="glass text-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="glass"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-4">
            {currentQuestion === testData.questions.length - 1 ? (
              <Button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="bg-gradient-success hover:bg-gradient-success/90"
              >
                {submitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Test
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-gradient-ai hover:bg-gradient-neural"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;