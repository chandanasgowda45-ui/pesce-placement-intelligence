import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CreateAccountForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "text-red-500" };
  if (score === 2) return { score, label: "Fair", color: "text-orange-500" };
  if (score === 3) return { score, label: "Good", color: "text-yellow-600" };
  if (score === 4) return { score, label: "Strong", color: "text-emerald-600" };
  return { score, label: "Very Strong", color: "text-emerald-500" };
}

export default function CreateAccountPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const isSubmittingRef = useRef(false);

  const { register, getValues, trigger, watch, formState: { errors } } = useForm<CreateAccountForm>();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");
  const terms = watch("terms", false);

  const strength = getPasswordStrength(password);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (isSubmittingRef.current) {
      return;
    }

    const isValid = await trigger();
    if (!isValid) return;

    const data = getValues();

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!data.terms) {
      toast.error("Please accept the terms and privacy policy");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await signUp(data.email.trim(), data.password, data.fullName.trim());

      if (result.error) {
        setSignupError(result.error.message || "Failed to create account");
      } else if (result.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
      } else {
        setSuccess(true);
        toast.success("Account created successfully!");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      }
    } catch {
      setSignupError("An unexpected error occurred");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (needsEmailConfirmation) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4 py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">Verify Your Email</h2>
          <p className="text-sm text-muted-foreground">
            Account created. Please verify your email before signing in.
            Check your inbox for the verification link.
          </p>
          <Link to="/login">
            <Button variant="outline" className="mt-4">
              Back to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4 py-8">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Account Created</h2>
          <p className="text-sm text-muted-foreground">
            Welcome to PESCE Placement Intelligence. Redirecting you to the dashboard...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Join PESCE Placement Intelligence to get started
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              disabled={isSubmitting}
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              })}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        strength.score <= 1 ? "w-1/5 bg-red-500" :
                        strength.score === 2 ? "w-2/5 bg-orange-500" :
                        strength.score === 3 ? "w-3/5 bg-yellow-600" :
                        strength.score === 4 ? "w-4/5 bg-emerald-600" :
                        "w-full bg-emerald-500"
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {password.length >= 8 ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-red-500" />}
                    At least 8 characters
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {/[A-Z]/.test(password) && /[a-z]/.test(password) ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-red-500" />}
                    Upper and lowercase letters
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {/\d/.test(password) ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-red-500" />}
                    At least one number
                  </div>
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isSubmitting}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              disabled={isSubmitting}
              {...register("terms", {
                required: "You must accept the terms and privacy policy",
              })}
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer">
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.terms && (
            <p className="text-xs text-destructive -mt-2">{errors.terms.message}</p>
          )}

          {signupError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {signupError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
