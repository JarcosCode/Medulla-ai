import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

// Note: In a real implementation, this would fetch from YouTube API
const MOCK_TRENDING = [
  {
    category: "Hip-Hop",
    song: "Example Hip-Hop Song",
    artist: "Example Artist",
    url: "https://youtube.com",
  },
  {
    category: "Pop",
    song: "Example Pop Song",
    artist: "Example Artist",
    url: "https://youtube.com",
  },
  {
    category: "Rock",
    song: "Example Rock Song",
    artist: "Example Artist",
    url: "https://youtube.com",
  },
];

export default function TrendingSongs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending on YouTube</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {MOCK_TRENDING.map((trend, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
          >
            <div className="flex-1">
              <Badge variant="outline" className="mb-2">
                {trend.category}
              </Badge>
              <h3 className="font-semibold">{trend.song}</h3>
              <p className="text-sm text-muted-foreground">{trend.artist}</p>
            </div>
            <Button size="icon" variant="ghost" asChild>
              <a href={trend.url} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="h-5 w-5" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
