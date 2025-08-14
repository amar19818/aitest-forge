import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Progress } from './progress';
import { Alert, AlertDescription } from './alert';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthProgress } from '@/utils/passwordValidation';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean;
  showToggle?: boolean;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, showToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [validation, setValidation] = useState(validatePassword(''));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (showStrength) {
        setValidation(validatePassword(value));
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="space-y-3">
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn(className)}
            onChange={handleChange}
          />
          {showToggle && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            </Button>
          )}
        </div>

        {showStrength && props.value && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Password strength</span>
                <span className={cn('text-sm font-medium', getPasswordStrengthColor(validation.strength))}>
                  {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
                </span>
              </div>
              <Progress 
                value={getPasswordStrengthProgress(validation.score)} 
                className="h-2"
              />
            </div>

            {validation.errors.length > 0 && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <ul className="text-sm space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index} className="text-destructive">• {error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validation.isValid && (
              <Alert className="border-success/50 bg-success/10">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-success">
                  Password meets all security requirements!
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };