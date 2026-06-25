import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Terminal, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "auth · portfolio";
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, result.data.email, result.data.password);
        toast.success("logged in");
      } else {
        await createUserWithEmailAndPassword(auth, result.data.email, result.data.password);
        toast.success("account created");
      }
      navigate("/", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> back
        </Link>

        <div className="terminal-card rounded-md p-8 space-y-6 animate-fade-up">
          <div className="flex items-center gap-2 font-mono text-sm">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">$ ./{mode === "signin" ? "login" : "register"}.sh</span>
          </div>

          <h1 className="font-display text-3xl font-bold">
            {mode === "signin" ? "admin access" : "create admin"}
            <span className="blink-caret"></span>
          </h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-mono text-xs">email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="font-mono text-xs">password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : mode === "signin" ? "> login" : "> register"}
            </Button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === "signin" ? "// no account? register" : "// have an account? login"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs font-mono text-muted-foreground">
          first signup auto-becomes admin.
        </p>
      </div>
    </div>
  );
};

export default Auth;
