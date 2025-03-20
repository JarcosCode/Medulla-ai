import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: SelectUser; token: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: SelectUser; token: string }, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Check for token on mount and set up error handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token ? 'Token exists' : 'No token found');
    
    // Handle errors that might occur during initialization
    const errorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'reason' in event ? event.reason : event.error;
      console.error('Unhandled error:', {
        error,
        type: event.type,
        message: error?.message,
        stack: error?.stack
      });
      
      toast({
        title: "An error occurred",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);

    if (!token) {
      queryClient.setQueryData(["/api/user"], null);
    }

    setInitialLoadComplete(true);

    // Cleanup error handlers
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, [toast]);

  const { data: user, isLoading, error } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: initialLoadComplete,
    initialData: null,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      console.log('Attempting login...');
      const res = await apiRequest("POST", "/api/login", data);
      const result = await res.json();
      console.log('Login response:', { success: !!result.token });
      return result;
    },
    onSuccess: (data) => {
      console.log('Login successful, saving token...');
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(["/api/user"], data.user);
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Logging out...');
      localStorage.removeItem('token');
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
    },
    onError: (error: Error) => {
      console.error('Logout failed:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      console.log('Attempting registration...');
      const validatedData = insertUserSchema.parse(data);
      const res = await apiRequest("POST", "/api/register", validatedData);
      const result = await res.json();
      console.log('Registration response:', { success: !!result.token });
      return result;
    },
    onSuccess: (data) => {
      console.log('Registration successful, saving token...');
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(["/api/user"], data.user);
    },
    onError: (error: Error) => {
      console.error('Registration failed:', error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!initialLoadComplete) {
    return null; // Don't render anything until initial load is complete
  }

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error: error instanceof Error ? error : null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
