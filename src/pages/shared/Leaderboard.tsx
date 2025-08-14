import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Clock, 
  Target,
  TrendingUp,
  Users
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/apiService';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  score?: {
    total: number;
    percentage: number;
    grade: string;
  };
  statistics?: {
    totalExams: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  };
  timeSpent?: number;
  attempt?: number;
  submittedAt?: string;
}

interface LeaderboardData {
  testId?: string;
  testTitle?: string;
  leaderboard?: LeaderboardEntry[];
  globalLeaderboard?: LeaderboardEntry[];
  totalParticipants?: number;
  generatedAt: string;
}

const Leaderboard: React.FC = () => {
  const { testId } = useParams<{ testId?: string }>();
  const { toast } = useToast();
  
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(testId ? 'test' : 'global');

  useEffect(() => {
    fetchLeaderboard();
  }, [testId, activeTab]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      let result;
      
      if (activeTab === 'test' && testId) {
        result = await apiService.getTestLeaderboard(testId);
      } else {
        result = await apiService.getGlobalLeaderboard();
      }
      
      setData(result);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load leaderboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-warning" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-warning/20 to-warning/10 border-warning/30';
      case 2: return 'bg-gradient-to-r from-gray-200/20 to-gray-200/10 border-gray-300/30';
      case 3: return 'bg-gradient-to-r from-orange-200/20 to-orange-200/10 border-orange-300/30';
      default: return 'bg-card-secondary border-border';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderLeaderboardEntry = (entry: LeaderboardEntry, isGlobal: boolean = false) => (
    <Card key={`${entry.rank}-${entry.userId}`} className={`${getRankBackground(entry.rank)} transition-all hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getRankIcon(entry.rank)}
          </div>
          
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-ai text-white font-bold">
              {getInitials(entry.profile.firstName, entry.profile.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold truncate">
              {entry.profile.firstName} {entry.profile.lastName}
            </h4>
            <p className="text-sm text-muted-foreground truncate">@{entry.username}</p>
          </div>
          
          <div className="flex-shrink-0 text-right">
            {isGlobal ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-primary">
                  {entry.statistics?.averageScore.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {entry.statistics?.totalExams} tests
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-lg font-bold text-primary">
                  {entry.score?.percentage}%
                </div>
                <Badge variant="outline" className="text-xs">
                  {entry.score?.grade}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        {!isGlobal && entry.timeSpent && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Time: {formatTime(entry.timeSpent)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-4 h-4" />
              <span>Attempt #{entry.attempt}</span>
            </div>
          </div>
        )}
        
        {isGlobal && entry.statistics && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Trophy className="w-3 h-3" />
              <span>Best: {entry.statistics.bestScore}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(entry.statistics.totalTimeSpent)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Avg: {entry.statistics.averageScore.toFixed(1)}%</span>
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
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gradient-ai">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">
              See how you rank against other students
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="global" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Global</span>
              </TabsTrigger>
              {testId && (
                <TabsTrigger value="test" className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Test</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="global" className="mt-6">
              <Card className="glass shadow-elevation animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <span>Global Leaderboard</span>
                  </CardTitle>
                  <CardDescription>
                    Top performers across all tests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.globalLeaderboard?.map((entry) => 
                      renderLeaderboardEntry(entry, true)
                    )}
                    
                    {(!data?.globalLeaderboard || data.globalLeaderboard.length === 0) && (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
                        <p className="text-muted-foreground">
                          Take some tests to see the global leaderboard!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {testId && (
              <TabsContent value="test" className="mt-6">
                <Card className="glass shadow-elevation animate-scale-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-info" />
                      <span>Test Leaderboard</span>
                    </CardTitle>
                    <CardDescription>
                      {data?.testTitle && `Results for "${data.testTitle}"`}
                      {data?.totalParticipants && ` • ${data.totalParticipants} participants`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data?.leaderboard?.map((entry) => 
                        renderLeaderboardEntry(entry, false)
                      )}
                      
                      {(!data?.leaderboard || data.leaderboard.length === 0) && (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Results Yet</h3>
                          <p className="text-muted-foreground">
                            Be the first to complete this test!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Footer Info */}
          {data?.generatedAt && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(data.generatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;