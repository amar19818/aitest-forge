import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  Search,
  Calendar,
  Award,
  BookOpen,
  Users,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import apiService from '@/services/apiService';

interface ExamHistory {
  testId: {
    title: string;
    topic: string;
  };
  score: number;
  percentage: number;
  completedAt: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [examHistory, setExamHistory] = useState<ExamHistory[]>([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyData, dashboardData] = await Promise.all([
          apiService.getUserExamHistory(1, 5),
          apiService.getUserDashboard()
        ]);
        
        setExamHistory(historyData.examHistory);
        setStats(dashboardData.statistics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleJoinTest = () => {
    if (accessCode.trim()) {
      window.location.href = `/join-test?code=${accessCode}`;
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return 'bg-gradient-success';
    if (percentage >= 70) return 'bg-gradient-warning';
    return 'bg-destructive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gradient-ai">Student Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.profile.firstName}! Ready to test your knowledge?
            </p>
          </div>
          <Link to="/leaderboard/global">
            <Button variant="outline" className="glass hover-glow animate-scale-in">
              <Trophy className="mr-2 h-4 w-4" />
              Global Leaderboard
            </Button>
          </Link>
        </div>

        {/* Join Test Section */}
        <Card className="glass shadow-elevation mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span>Join a Test</span>
            </CardTitle>
            <CardDescription>
              Enter an access code to join a test created by your teacher
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter access code (e.g., A1B2C3)"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="pl-10 glass"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={handleJoinTest}
                className="bg-gradient-ai hover:bg-gradient-neural group"
                disabled={!accessCode.trim()}
              >
                Join Test
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover-lift animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tests Taken</p>
                  <p className="text-2xl font-bold">{stats.totalExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-warning rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Best Score</p>
                  <p className="text-2xl font-bold">{stats.bestScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-neural rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{Math.floor(stats.totalTimeSpent / 60)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Recent Test Results</h2>
            <Link to="/student/history">
              <Button variant="outline" size="sm" className="glass">
                View All History
              </Button>
            </Link>
          </div>

          {examHistory.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tests taken yet</h3>
                <p className="text-muted-foreground mb-6">
                  Join your first test using an access code from your teacher
                </p>
                <Button 
                  onClick={() => document.querySelector('input')?.focus()}
                  className="bg-gradient-ai hover:bg-gradient-neural"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Enter Access Code
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examHistory.map((exam, index) => (
                <Card key={index} className="glass hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{exam.testId.title}</CardTitle>
                        <CardDescription>{exam.testId.topic}</CardDescription>
                      </div>
                      <Badge className={`${getScoreBadge(exam.percentage)} text-white`}>
                        {exam.percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Score</p>
                          <p className={`font-bold text-lg ${getScoreColor(exam.percentage)}`}>
                            {exam.score}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Percentage</p>
                          <p className={`font-bold text-lg ${getScoreColor(exam.percentage)}`}>
                            {exam.percentage}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(exam.completedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <Button variant="outline" size="sm" className="w-full glass">
                        <Award className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass hover-lift animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-ai rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Global Leaderboard</h3>
                  <p className="text-sm text-muted-foreground">See how you rank against other students</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">Track your progress over time</p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;