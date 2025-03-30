import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useLocation } from "wouter";
import { Loader2, Music2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
    },
  });

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to Medulla.AI</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login-username">Username</Label>
                      <Input id="login-username" {...loginForm.register("username")} />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input type="password" id="login-password" {...loginForm.register("password")} />
                    </div>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Login
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" type="email" {...registerForm.register("username")} />
                    </div>
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input id="register-username" {...registerForm.register("displayName")} />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input type="password" id="register-password" {...registerForm.register("password")} />
                    </div>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign Up
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 relative overflow-hidden p-8">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-md text-center px-8 py-12 backdrop-blur-sm rounded-2xl border border-white/10 bg-white/5">
          {/* Decorative Music Vector Art */}
          <div className="mb-8 relative">
            <svg
              viewBox="0 0 24 24"
              className="w-48 h-48 mx-auto text-indigo-400/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <g>
                {/* Musical Note Group */}
                <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="21" cy="16" r="3" />
                
                {/* Decorative Sound Waves */}
                <path className="text-pink-400/60" d="M3 10.5c2-2 4-2 6 0" strokeLinecap="round" />
                <path className="text-purple-400/60" d="M3 7.5c3-3 6-3 9 0" strokeLinecap="round" />
                <path className="text-indigo-400/60" d="M3 4.5c4-4 8-4 12 0" strokeLinecap="round" />
              </g>
            </svg>
            
            {/* Additional Floating Music Symbols */}
            <svg className="absolute top-0 right-0 w-12 h-12 text-pink-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <svg className="absolute bottom-0 left-0 w-10 h-10 text-indigo-400/20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 17H5v-2h4v2zm10-2h-4v2h4v-2zm-6 2h-2v-2h2v2zm6-9v2h-4V8h4zm-6 0v2h-2V8h2zm-4 0v2H5V8h4z"/>
            </svg>
          </div>
          
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Get Personalized Music Recommendations
          </h2>
          
          <p className="text-lg text-white/80 leading-relaxed">
            Create an account to unlock unlimited music recommendations powered by AI. Discover new songs
            and playlists tailored to your taste.
          </p>

          {/* Bottom decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40"></div>
        </div>
      </div>
    </div>
  );
}