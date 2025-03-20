import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TrendingVideo {
  id: string;
  title: string;
  channelTitle: string;
  url: string;
}

interface TrendingData {
  [category: string]: TrendingVideo;
}

export default function TrendingSongs() {
  const { data: trending, isLoading, error } = useQuery<TrendingData>({
    queryKey: ["trending"],
    queryFn: async () => {
      const response = await fetch('/api/trending');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    retry: 1
  });

  // Log component state for debugging
  console.log("Trending component state:", { 
    isLoading, 
    error: error ? {
      message: error.message,
      stack: error.stack
    } : null, 
    hasData: !!trending 
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending on YouTube</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading trending videos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending on YouTube</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load trending songs.</p>
          <p className="text-xs text-red-500 mt-2">Error: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!trending || Object.keys(trending).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending on YouTube</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No trending videos available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending on YouTube</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(trending).map(([category, video]) => (
          <div
            key={video.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
          >
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {category}
              </Badge>
              <h3 className="font-semibold">{video.title}</h3>
              <p className="text-sm text-muted-foreground">{video.channelTitle}</p>
            </div>
            <Button size="icon" variant="ghost" asChild>
              <a href={video.url} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="h-5 w-5" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}