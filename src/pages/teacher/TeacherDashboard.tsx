import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  Share2, 
  Eye,
  Settings,
  BarChart3,
  Brain
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import apiService from '@/services/apiService';

interface Test {
  _id: string;
  title: string;
  topic: string;
  status: 'published' | 'draft' | 'archived';
  settings: {
    duration: number;
    totalMarks: number;
  };
  analytics: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  };
  accessControl: {
    accessCode: string;
  };
  createdAt: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
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
        const [testsData, dashboardData] = await Promise.all([
          apiService.getUserTests(),
          apiService.getUserDashboard()
        ]);
        
        setTests(testsData);
        setStats(dashboardData.statistics);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-gradient-success';
      case 'draft': return 'bg-gradient-warning';
      case 'archived': return 'bg-muted';
      default: return 'bg-muted';
    }
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
            <h1 className="text-3xl font-bold text-gradient-ai">Teacher Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user?.profile.firstName}! Ready to create amazing tests?
            </p>
          </div>
          <Link to="/teacher/create-test">
            <Button className="bg-gradient-ai hover:bg-gradient-neural group animate-scale-in">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
              Create New Test
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass hover-lift animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{stats.totalExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-warning rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
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

        {/* Tests Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Tests</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="glass">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
          </div>

          {tests.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No tests created yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first AI-powered test to get started with LiveTest.AI
                </p>
                <Link to="/teacher/create-test">
                  <Button className="bg-gradient-ai hover:bg-gradient-neural">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Test
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test, index) => (
                <Card key={test._id} className="glass hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{test.title}</CardTitle>
                        <CardDescription>{test.topic}</CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(test.status)} text-white`}>
                        {test.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{test.settings.duration} min</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Marks</p>
                          <p className="font-medium">{test.settings.totalMarks}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Attempts</p>
                          <p className="font-medium">{test.analytics.totalAttempts}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Score</p>
                          <p className="font-medium">{test.analytics.averageScore.toFixed(1)}%</p>
                        </div>
                      </div>

                      {test.status === 'published' && (
                        <div className="p-3 bg-card-secondary rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Access Code</p>
                          <p className="font-mono text-sm font-bold text-primary">{test.accessControl.accessCode}</p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1 glass">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 glass">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;