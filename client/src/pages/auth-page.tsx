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
                      <Label htmlFor="register-displayName">Display Name</Label>
                      <Input id="register-displayName" {...registerForm.register("displayName")} />
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

      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-8">
        <div className="max-w-md text-center">
          <Music2 className="mx-auto h-16 w-16 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-4">Get Personalized Music Recommendations</h2>
          <p className="text-muted-foreground">
            Create an account to unlock unlimited music recommendations powered by AI. Discover new songs
            and playlists tailored to your taste.
          </p>
        </div>
      </div>
    </div>
  );
}