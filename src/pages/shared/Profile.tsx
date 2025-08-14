import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  School, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Trophy,
  Target,
  Clock,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/ui/loading-spinner';
import api from '@/services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    institution: user?.profile.institution || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          institution: formData.institution
        }
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast({
            title: 'Error',
            description: 'New passwords do not match',
            variant: 'destructive'
          });
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await api.patch('/users/profile', updateData);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      
      setEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const firstName = user?.profile.firstName || '';
    const lastName = user?.profile.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeColor = () => {
    return user?.role === 'teacher' ? 'bg-gradient-ai' : 'bg-gradient-success';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background-tertiary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gradient-ai mb-2">User Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-2">
              <Card className="glass shadow-elevation animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-gradient-ai text-white text-xl font-bold">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{user.profile.firstName} {user.profile.lastName}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <span>@{user.username}</span>
                          <Badge className={getRoleBadgeColor()}>
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </CardDescription>
                      </div>
                    </div>
                    {!editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                        className="glass"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {editing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                              className="glass"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                              className="glass"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institution</Label>
                          <Input
                            id="institution"
                            value={formData.institution}
                            onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                            className="glass"
                            placeholder="Your school, university, or organization"
                          />
                        </div>

                        {/* Password Change Section */}
                        <div className="pt-4 border-t border-border">
                          <h4 className="font-medium mb-4">Change Password</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="glass"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="glass"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-gradient-success hover:bg-gradient-success/90"
                          >
                            {loading ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditing(false);
                              setFormData({
                                firstName: user?.profile.firstName || '',
                                lastName: user?.profile.lastName || '',
                                institution: user?.profile.institution || '',
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                            }}
                            className="glass"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 bg-card-secondary rounded-lg">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-4 bg-card-secondary rounded-lg">
                          <User className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Username</p>
                            <p className="font-medium">@{user.username}</p>
                          </div>
                        </div>

                        {user.profile.institution && (
                          <div className="flex items-center space-x-3 p-4 bg-card-secondary rounded-lg">
                            <School className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm text-muted-foreground">Institution</p>
                              <p className="font-medium">{user.profile.institution}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card className="glass shadow-elevation animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-warning" />
                    <span>Quick Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <Target className="w-8 h-8 text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success">--</p>
                      <p className="text-sm text-muted-foreground">Tests {user.role === 'teacher' ? 'Created' : 'Taken'}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <Clock className="w-8 h-8 text-info mx-auto mb-2" />
                      <p className="text-2xl font-bold text-info">--</p>
                      <p className="text-sm text-muted-foreground">Hours Spent</p>
                    </div>

                    <div className="text-center p-4 bg-card-secondary rounded-lg">
                      <BookOpen className="w-8 h-8 text-warning mx-auto mb-2" />
                      <p className="text-2xl font-bold text-warning">--</p>
                      <p className="text-sm text-muted-foreground">{user.role === 'teacher' ? 'Avg Participation' : 'Avg Score'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Alert className="glass border-primary/30">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your account is {user.role === 'teacher' ? 'verified as an educator' : 'active as a student'}. 
                  Contact support if you need to change your role.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;