import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Bus, GraduationCap, Shield, Truck, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/ThemeToggle";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin' | 'driver'>('student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        toast.success(`Welcome back! Redirecting to ${selectedRole} dashboard...`);
        navigate(`/${selectedRole}`);
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    {
      id: 'student',
      icon: GraduationCap,
      label: 'Student',
      description: 'Check routes & fees',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary'
    },
    {
      id: 'admin',
      icon: Shield,
      label: 'Admin',
      description: 'Manage entire fleet',
      color: 'text-accent',
      bg: 'bg-accent/10',
      border: 'border-accent'
    },
    {
      id: 'driver',
      icon: Truck,
      label: 'Driver',
      description: 'View schedule',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500'
    }
  ] as const;

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-black text-white p-12 flex-col justify-between">
        {/* Background gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Bus className="w-5 h-5 text-black" />
            </div>
            <span className="font-display text-xl font-bold">EduRide</span>
          </div>

          <h1 className="font-display text-5xl font-bold leading-tight mb-6">
            The smart way to <br />
            <span className="text-accent">manage transport.</span>
          </h1>
          <p className="text-lg text-white/60 max-w-md">
            Streamline your school's transportation with real-time tracking, automated billing, and enhanced safety features.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-6 relative z-10">
          <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-white/10">
            <p className="text-3xl font-bold">500+</p>
            <p className="text-sm text-white/70">Active Students</p>
          </div>
          <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-white/10">
            <p className="text-3xl font-bold">15</p>
            <p className="text-sm text-white/70">Bus Routes</p>
          </div>
          <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-white/10">
            <p className="text-3xl font-bold">₹2.5L</p>
            <p className="text-sm text-white/70">Monthly Revenue</p>
          </div>
          <div className="p-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-white/10">
            <p className="text-3xl font-bold">98%</p>
            <p className="text-sm text-white/70">On-Time Pickups</p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-white/40 space-y-1">
          <p>© {new Date().getFullYear()} EduRide Inc.</p>
          <p>Developed by <span className="text-white/80 font-medium">Prafull Harer</span></p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative animate-fade-in">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Home
        </Link>
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-lg space-y-8 animate-fade-in">
          <div className="text-center lg:text-left">
            <h2 className="font-display text-3xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Please select your role and sign in to continue.</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all duration-200 outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedRole === role.id
                    ? `border-${role.color.split('-')[1]} bg-card shadow-lg scale-105 z-10 ring-1 ring-offset-0 ${role.border}`
                    : "border-border bg-transparent hover:border-primary/50 hover:bg-muted/50 opacity-70 hover:opacity-100"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors",
                  selectedRole === role.id ? role.bg : "bg-muted"
                )}>
                  <role.icon className={cn("w-4 h-4", selectedRole === role.id ? role.color : "text-muted-foreground")} />
                </div>
                <div className="font-semibold text-sm">{role.label}</div>
              </button>
            ))}
          </div>

          <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12 bg-background/50 focus:bg-background transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base gradient-primary hover:opacity-90 shadow-glow transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In as {roles.find(r => r.id === selectedRole)?.label}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Don't have an account?{" "}
              <Link to="/contact" className="text-primary font-medium hover:underline">
                Contact Administration
              </Link>
            </p>

            <div className="mt-8 flex justify-center gap-4 opacity-50 text-xs">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
