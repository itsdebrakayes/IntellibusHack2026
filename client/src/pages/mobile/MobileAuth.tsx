import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "login" | "signup" | "forgot";

const MobileAuth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) { toast({ title: "Error", description: error, variant: "destructive" }); return; }
        toast({ title: "Reset link sent", description: "Check your email for password reset instructions." });
        setMode("login");
        return;
      }

      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) { toast({ title: "Sign in failed", description: error, variant: "destructive" }); return; }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) { toast({ title: "Sign up failed", description: error, variant: "destructive" }); return; }
      }
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-8 pt-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">CyberShield</h1>
          <p className="text-xs text-muted-foreground">AI-Powered Cybersecurity</p>
        </div>

        {/* Title */}
        <div className="mb-6 text-center">
          <h2 className="font-display text-lg font-bold text-foreground">
            {mode === "login" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "login" ? "Sign in to your account" : mode === "signup" ? "Get started with CyberShield" : "We'll send you a reset link"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>Don't have an account?{" "}<button onClick={() => setMode("signup")} className="text-primary hover:underline">Sign up</button></>
          ) : (
            <>Already have an account?{" "}<button onClick={() => setMode("login")} className="text-primary hover:underline">Sign in</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MobileAuth;
