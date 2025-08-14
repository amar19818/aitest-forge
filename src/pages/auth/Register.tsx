import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Mail, Lock, User, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/ui/loading-spinner';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'teacher',
    profile: {
      firstName: '',
      lastName: '',
      institution: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      // Navigation will be handled by App.tsx based on user role
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background-secondary to-background-tertiary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient-ai">LiveTest.AI</h1>
          <p className="text-muted-foreground mt-2">Join the future of AI-powered testing</p>
        </div>

        <Card className="glass shadow-elevation animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to start creating or taking AI-generated tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 border-destructive/50 bg-destructive/10">
                <AlertDescription className="text-destructive">{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => updateFormData('role', value)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover-glow cursor-pointer">
                    <RadioGroupItem value="student" id="student" />
                    <label htmlFor="student" className="flex items-center space-x-2 cursor-pointer flex-1">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Student</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border border-border rounded-lg p-3 hover-glow cursor-pointer">
                    <RadioGroupItem value="teacher" id="teacher" />
                    <label htmlFor="teacher" className="flex items-center space-x-2 cursor-pointer flex-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Teacher</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.profile.firstName}
                    onChange={(e) => updateFormData('profile.firstName', e.target.value)}
                    className="glass"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.profile.lastName}
                    onChange={(e) => updateFormData('profile.lastName', e.target.value)}
                    className="glass"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => updateFormData('username', e.target.value)}
                    className="pl-10 glass"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-10 glass"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className="pl-10 glass"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution (Optional)</Label>
                <Input
                  id="institution"
                  placeholder="Your school or university"
                  value={formData.profile.institution}
                  onChange={(e) => updateFormData('profile.institution', e.target.value)}
                  className="glass"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-ai hover:bg-gradient-neural transition-all duration-300 group"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary-glow transition-colors font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;