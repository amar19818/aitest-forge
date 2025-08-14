import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiService from '@/services/apiService';

interface StudentPerformance {
  userId: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  submission: {
    id: string;
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
    completionRate: number;
  };
  questionAnalysis: {
    correctAnswers: number;
    totalQuestions: number;
    timePerQuestion: number[];
    difficultyBreakdown: {
      easy: { correct: number; total: number };
      medium: { correct: number; total: number };
      hard: { correct: number; total: number };
    };
  };
}

interface TestAnalytics {
  testInfo: {
    id: string;
    title: string;
    totalQuestions: number;
    totalMarks: number;
    duration: number;
  };
  summary: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    averageTime: number;
    topScore: number;
    passingRate: number;
  };
  students: StudentPerformance[];
  questionStats: {
    questionId: string;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    correctAnswers: number;
    totalAttempts: number;
    averageTime: number;
  }[];
}

const StudentAnalytics: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { toast } = useToast();
  
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    if (testId) {
      fetchAnalytics();
    }
  }, [testId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Note: This would be a new endpoint specifically for teacher analytics
      const response = await fetch(`/api/tests/${testId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-success';
    if (percentage >= 80) return 'text-info';
    if (percentage >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-gradient-success';
      case 'B': return 'bg-gradient-info';
      case 'C': return 'bg-gradient-warning';
      default: return 'bg-destructive';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const filteredAndSortedStudents = analytics?.students
    .filter(student => {
      const matchesSearch = 
        student.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterBy === 'all') return matchesSearch;
      if (filterBy === 'passed') return matchesSearch && student.submission.score.percentage >= 60;
      if (filterBy === 'failed') return matchesSearch && student.submission.score.percentage < 60;
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.submission.score.percentage - a.submission.score.percentage;
        case 'time':
          return a.submission.timing.totalTimeSpent - b.submission.timing.totalTimeSpent;
        case 'name':
          return a.profile.firstName.localeCompare(b.profile.firstName);
        default:
          return 0;
      }
    }) || [];

  const exportData = () => {
    if (!analytics) return;
    
    const csvContent = [
      ['Name', 'Username', 'Score', 'Grade', 'Time Spent', 'Completion Rate', 'Attempt'].join(','),
      ...filteredAndSortedStudents.map(student => [
        `${student.profile.firstName} ${student.profile.lastName}`,
        student.username,
        `${student.submission.score.percentage}%`,
        student.submission.score.grade,
        formatTime(student.submission.timing.totalTimeSpent),
        `${student.submission.completionRate}%`,
        student.submission.attempt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analytics.testInfo.title}_analytics.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground">No student submissions found for this test.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gradient-ai">{analytics.testInfo.title}</h1>
                <p className="text-muted-foreground mt-2">Student Performance Analytics</p>
              </div>
              <Button onClick={exportData} variant="outline" className="glass">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Student Performance</TabsTrigger>
              <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="glass shadow-elevation">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-ai rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Attempts</p>
                        <p className="text-2xl font-bold">{analytics.summary.totalAttempts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-elevation">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                        <p className="text-2xl font-bold">{analytics.summary.averageScore.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-elevation">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Time</p>
                        <p className="text-2xl font-bold">{formatTime(analytics.summary.averageTime)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-elevation">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-info rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Top Score</p>
                        <p className="text-2xl font-bold">{analytics.summary.topScore}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass shadow-elevation">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5" />
                      <span>Pass/Fail Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-success">Passed (≥60%)</span>
                          <span className="text-sm font-medium">{analytics.summary.passingRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={analytics.summary.passingRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-destructive">Failed (&lt;60%)</span>
                          <span className="text-sm font-medium">{(100 - analytics.summary.passingRate).toFixed(1)}%</span>
                        </div>
                        <Progress value={100 - analytics.summary.passingRate} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass shadow-elevation">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Completion Rate</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gradient-ai mb-2">
                          {analytics.summary.completionRate.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Students completed the test
                        </p>
                      </div>
                      <Progress value={analytics.summary.completionRate} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <Card className="glass shadow-elevation">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div>
                      <CardTitle>Student Performance</CardTitle>
                      <CardDescription>Detailed breakdown of individual student results</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search students..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 glass"
                        />
                      </div>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32 glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="score">Score</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterBy} onValueChange={setFilterBy}>
                        <SelectTrigger className="w-32 glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="passed">Passed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredAndSortedStudents.map((student) => (
                      <Card key={student.userId} className="bg-card-secondary border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-ai text-white font-bold">
                                {getInitials(student.profile.firstName, student.profile.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {student.profile.firstName} {student.profile.lastName}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">@{student.username}</p>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${getPerformanceColor(student.submission.score.percentage)}`}>
                                    {student.submission.score.percentage}%
                                  </div>
                                  <Badge className={getGradeColor(student.submission.score.grade)}>
                                    Grade {student.submission.score.grade}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-success" />
                                  <span>{student.questionAnalysis.correctAnswers}/{student.questionAnalysis.totalQuestions} correct</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-info" />
                                  <span>{formatTime(student.submission.timing.totalTimeSpent)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Target className="w-4 h-4 text-warning" />
                                  <span>Attempt #{student.submission.attempt}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="w-4 h-4 text-primary" />
                                  <span>{student.submission.completionRate}% complete</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {filteredAndSortedStudents.length === 0 && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                        <p className="text-muted-foreground">
                          No students match your current search and filter criteria.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="mt-6">
              <Card className="glass shadow-elevation">
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>Performance breakdown by individual questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {analytics.questionStats.map((question, index) => (
                      <div key={question.questionId} className="p-4 bg-card-secondary rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-medium mb-2">
                              Question {index + 1}: {question.question}
                            </h4>
                            <Badge 
                              variant="outline" 
                              className={
                                question.difficulty === 'easy' ? 'border-success text-success' :
                                question.difficulty === 'medium' ? 'border-warning text-warning' :
                                'border-destructive text-destructive'
                              }
                            >
                              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {((question.correctAnswers / question.totalAttempts) * 100).toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {question.correctAnswers}/{question.totalAttempts} correct
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress 
                            value={(question.correctAnswers / question.totalAttempts) * 100} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Avg time: {formatTime(question.averageTime)}</span>
                            <span>Difficulty: {question.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;