import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function TrendingSongs() {
  const { data: trending, isLoading, error } = useQuery({
    queryKey: ["/api/trending"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending on YouTube</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
        {Object.entries(trending || {}).map(([category, video]) => (
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