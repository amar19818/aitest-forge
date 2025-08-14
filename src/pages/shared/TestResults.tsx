import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  Home, 
  Share2,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface QuestionResult {
  question: string;
  type: 'mcq' | 'fill_in_blank';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  totalPoints: number;
  explanation?: string;
  timeSpent: number;
}

interface TestResults {
  submission: {
    id: string;
    testTitle: string;
    score: {
      total: number;
      percentage: number;
      grade: string;
    };
    timing: {
      startedAt: string;
      submittedAt: string;
      totalTimeSpent: number;
    };
    attempt: number;
  };
  results: QuestionResult[];
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    totalTimeSpent: number;
    averageTimePerQuestion: number;
  };
}

const TestResults: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (submissionId) {
      fetchResults();
    }
  }, [submissionId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTestResults(submissionId!);
      setResults(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load results',
        variant: 'destructive'
      });
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-gradient-success';
      case 'B': return 'bg-gradient-info';
      case 'C': return 'bg-gradient-warning';
      case 'D': return 'bg-gradient-warning';
      default: return 'bg-destructive';
    }
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { message: 'Outstanding Performance!', icon: Trophy, color: 'text-success' };
    if (percentage >= 80) return { message: 'Great Job!', icon: Award, color: 'text-info' };
    if (percentage >= 70) return { message: 'Good Work!', icon: TrendingUp, color: 'text-warning' };
    if (percentage >= 60) return { message: 'Keep Practicing!', icon: Target, color: 'text-warning' };
    return { message: 'Room for Improvement', icon: AlertCircle, color: 'text-destructive' };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const handleShare = () => {
    const shareText = `I just scored ${results?.submission.score.percentage}% on "${results?.submission.testTitle}"! 🎉`;
    if (navigator.share) {
      navigator.share({
        title: 'Test Results',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied!',
        description: 'Results copied to clipboard'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Results Not Found</h2>
            <p className="text-muted-foreground mb-4">The test results you're looking for don't exist.</p>
            <Button onClick={() => navigate('/student/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performance = getPerformanceMessage(results.submission.score.percentage);
  const PerformanceIcon = performance.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-gradient-ai rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
              <PerformanceIcon className={`w-10 h-10 ${performance.color}`} />
            </div>
            <h1 className="text-3xl font-bold text-gradient-ai mb-2">Test Results</h1>
            <p className="text-muted-foreground">{results.submission.testTitle}</p>
          </div>

          {/* Score Card */}
          <Card className="glass shadow-elevation mb-8 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{performance.message}</CardTitle>
                  <CardDescription>Attempt #{results.submission.attempt}</CardDescription>
                </div>
                <Badge className={getGradeColor(results.submission.score.grade)}>
                  Grade {results.submission.score.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className="text-6xl font-bold text-gradient-ai mb-2">
                    {results.submission.score.percentage}%
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {results.submission.score.total} out of {results.summary.totalQuestions * (results.results[0]?.totalPoints || 1)} points
                  </p>
                  <Progress 
                    value={results.submission.score.percentage} 
                    className="mt-4 h-3"
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="text-center p-4 bg-card-secondary rounded-lg">
                    <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="text-xl font-bold text-success">{results.summary.correctAnswers}</p>
                  </div>
                  <div className="text-center p-4 bg-card-secondary rounded-lg">
                    <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                    <p className="text-xl font-bold text-destructive">
                      {results.summary.totalQuestions - results.summary.correctAnswers}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-card-secondary rounded-lg">
                    <Clock className="w-6 h-6 text-info mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Time Spent</p>
                    <p className="text-xl font-bold text-info">{formatTime(results.summary.totalTimeSpent)}</p>
                  </div>
                  <div className="text-center p-4 bg-card-secondary rounded-lg">
                    <Target className="w-6 h-6 text-warning mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Avg per Q</p>
                    <p className="text-xl font-bold text-warning">{formatTime(results.summary.averageTimePerQuestion)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    onClick={() => setShowDetails(!showDetails)}
                    variant="outline"
                    className="flex-1 glass"
                  >
                    {showDetails ? 'Hide' : 'Show'} Question Details
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 glass"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Results
                  </Button>
                  <Button
                    onClick={() => navigate('/student/dashboard')}
                    className="flex-1 bg-gradient-ai hover:bg-gradient-neural"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Details */}
          {showDetails && (
            <Card className="glass shadow-elevation animate-scale-in">
              <CardHeader>
                <CardTitle>Question by Question Breakdown</CardTitle>
                <CardDescription>Detailed review of your answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {results.results.map((result, index) => (
                    <div key={index}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {result.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-success" />
                          ) : (
                            <XCircle className="w-6 h-6 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">
                            Question {index + 1}: {result.question}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="text-muted-foreground">Your answer:</span>
                              <span className={result.isCorrect ? 'text-success' : 'text-destructive'}>
                                {result.userAnswer || 'No answer'}
                              </span>
                            </div>
                            {!result.isCorrect && (
                              <div className="flex items-center space-x-4">
                                <span className="text-muted-foreground">Correct answer:</span>
                                <span className="text-success">{result.correctAnswer}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-4">
                              <span className="text-muted-foreground">Points:</span>
                              <span>{result.pointsEarned}/{result.totalPoints}</span>
                              <span className="text-muted-foreground">Time:</span>
                              <span>{formatTime(result.timeSpent)}</span>
                            </div>
                            {result.explanation && (
                              <div className="mt-2 p-3 bg-card-secondary rounded-lg">
                                <p className="text-info font-medium">Explanation:</p>
                                <p className="text-muted-foreground mt-1">{result.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < results.results.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestResults;