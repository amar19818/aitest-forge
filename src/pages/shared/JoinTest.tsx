import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Clock, 
  Target, 
  User, 
  BookOpen, 
  ArrowRight,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import apiService from '@/services/apiService';

interface TestInfo {
  id: string;
  title: string;
  description: string;
  topic: string;
  duration: number;
  totalMarks: number;
  questionCount: number;
  createdBy: {
    username: string;
  };
}

const JoinTest: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setAccessCode(code);
      handleJoinTest(code);
    }
  }, [searchParams]);

  const handleJoinTest = async (code?: string) => {
    const codeToUse = code || accessCode;
    if (!codeToUse.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiService.joinTest(codeToUse);
      setTestInfo(response.test);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid access code. Please check and try again.');
      setTestInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    if (testInfo) {
      navigate(`/take-test/${testInfo.id}`);
    }
  };

  const getDifficultyColor = (duration: number) => {
    if (duration <= 15) return 'bg-gradient-success';
    if (duration <= 45) return 'bg-gradient-warning';
    return 'bg-destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient-ai">Join Test</h1>
            <p className="text-muted-foreground mt-2">
              Enter your access code to join a test
            </p>
          </div>

          {/* Access Code Input */}
          {!testInfo && (
            <Card className="glass shadow-elevation mb-8 animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-primary" />
                  <span>Enter Access Code</span>
                </CardTitle>
                <CardDescription>
                  Your teacher will provide you with a unique access code
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode">Access Code</Label>
                    <Input
                      id="accessCode"
                      placeholder="Enter 6-character code (e.g., A1B2C3)"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                      className="glass text-lg font-mono text-center"
                      maxLength={6}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleJoinTest();
                        }
                      }}
                    />
                  </div>

                  <Button
                    onClick={() => handleJoinTest()}
                    disabled={!accessCode.trim() || loading}
                    className="w-full bg-gradient-ai hover:bg-gradient-neural group"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Test
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Information */}
          {testInfo && (
            <Card className="glass shadow-elevation animate-scale-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{testInfo.title}</CardTitle>
                    <CardDescription className="text-base">{testInfo.description}</CardDescription>
                  </div>
                  <Badge className="bg-gradient-success text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Access Granted
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Test Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Topic</p>
                      <p className="font-medium">{testInfo.topic}</p>
                    </div>
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <Clock className="w-6 h-6 text-warning mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{testInfo.duration} min</p>
                    </div>
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <Target className="w-6 h-6 text-success mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="font-medium">{testInfo.questionCount}</p>
                    </div>
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <Target className="w-6 h-6 text-info mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Total Marks</p>
                      <p className="font-medium">{testInfo.totalMarks}</p>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="flex items-center space-x-3 p-4 bg-card-secondary rounded-lg">
                    <div className="w-10 h-10 bg-gradient-ai rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Created by</p>
                      <p className="font-medium">{testInfo.createdBy.username}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary-glow/10 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Test Instructions</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Make sure you have a stable internet connection</li>
                      <li>• You have {testInfo.duration} minutes to complete the test</li>
                      <li>• Your answers will be auto-saved as you progress</li>
                      <li>• Once you start, the timer cannot be paused</li>
                      <li>• Submit before time runs out to ensure your answers are recorded</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTestInfo(null);
                        setAccessCode('');
                        setError('');
                      }}
                      className="flex-1 glass"
                    >
                      Use Different Code
                    </Button>
                    <Button
                      onClick={startTest}
                      className="flex-1 bg-gradient-success hover:bg-gradient-success/90 group"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Start Test
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-muted-foreground">
            <p className="text-sm">
              Need help? Contact your teacher for the correct access code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinTest;