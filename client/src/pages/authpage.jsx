import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { TriangleAlert } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoginImg from "../assets/loginImg.jpg";
import googleIcon from "../assets/googleIcon.svg";
import Bg from "../assets/loginBg.jpg";

function friendlyError(err) {
  switch (err?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/popup-closed-by-user":
      return null;
    default:
      return "Something went wrong. Please try again.";
  }
}

export function LoginForm() {
  const { syncing, authError, refreshUser, logout } = useAuth();
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || syncing;
  const displayError = error || authError;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const googleAuth = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(friendlyError(err));
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${Bg})` }}
    >
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-md">
        <div className="hidden w-1/2 md:flex">
          <img src={LoginImg} alt="" className="h-full w-full object-cover" />
        </div>

        <div className="flex w-full flex-col justify-center p-8 md:w-1/2">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {isSignUp ? "Set up Managio for your business." : "Log in to your Managio account."}
          </p>

          {syncing && (
            <p className="mb-4 text-sm text-muted-foreground">Signing you in…</p>
          )}

          {displayError && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              <div>
                <p>{displayError}</p>
                {authError && (
                  <div className="mt-1.5 flex gap-3">
                    <button type="button" onClick={refreshUser} className="text-xs font-semibold underline underline-offset-2">
                      Try again
                    </button>
                    <button type="button" onClick={logout} className="text-xs font-semibold underline underline-offset-2">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="mb-4 flex flex-col gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy} className="mt-1.5">
              {busy ? "Please wait…" : isSignUp ? "Sign up" : "Log in"}
            </Button>
          </form>

          <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button onClick={googleAuth} type="button" variant="outline" disabled={busy} className="gap-2.5">
            <img src={googleIcon} alt="" className="h-4 w-4" />
            {isSignUp ? "Sign up with Google" : "Sign in with Google"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              {isSignUp ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
