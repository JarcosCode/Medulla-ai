import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_URL = 'http://localhost:5000';

// Enhanced error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      errorData = await res.text();
    }
    throw new ApiError(
      errorData?.message || res.statusText,
      res.status,
      errorData
    );
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  console.log('Getting auth headers, token:', token ? 'exists' : 'not found');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  console.log(`Making ${method} request to ${path}...`);
  const headers = getAuthHeaders();
  console.log('Request headers:', headers);
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error('API request failed:', {
      error,
      method,
      path,
      url,
      headers,
    });
    throw error;
  }
}

// Configure the QueryClient with retries and error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) {
          return false; // Don't retry auth errors
        }
        return failureCount < 2; // Only retry once
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // Disable automatic refetching
      refetchOnReconnect: false, // Disable automatic refetching
    },
    mutations: {
      retry: false,
    },
  },
});

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = (queryKey[0] as string).startsWith('http') 
        ? queryKey[0] as string 
        : `${API_URL}${queryKey[0]}`;
        
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new ApiError("Unauthorized", 401);
      }

      await throwIfResNotOk(res);
      return res.json();
    } catch (error) {
      console.error('Query failed:', {
        error,
        queryKey,
        unauthorizedBehavior,
      });
      throw error;
    }
  };
