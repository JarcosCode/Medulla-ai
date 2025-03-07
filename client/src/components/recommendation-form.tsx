import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, PlaySquare, ThumbsUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BookmarkPlus } from "lucide-react";

type RecommendationFormProps = {
  limits?: {
    songRecsCount: number;
    playlistRecsCount: number;
  };
};

function isValidUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.host.length > 0;
  } catch {
    console.log('Invalid URL:', url);
    return false;
  }
}

export default function RecommendationForm({ limits }: RecommendationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [type, setType] = useState<"songs" | "playlists">("songs");
  const form = useForm({
    defaultValues: {
      preferences: "",
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: async (data: { preferences: string; type: "songs" | "playlists" }) => {
      const res = await apiRequest("POST", "/api/recommendations", data);
      const result = await res.json();
      console.log('API Response:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-limits"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error getting recommendations",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (playlist: any) => {
      const res = await apiRequest("POST", "/api/playlists", playlist);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist saved",
        description: "The playlist has been added to your saved items.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button
          variant={type === "songs" ? "default" : "outline"}
          onClick={() => setType("songs")}
          className="flex-1"
        >
          <Music className="mr-2 h-4 w-4" />
          Songs
        </Button>
        <Button
          variant={type === "playlists" ? "default" : "outline"}
          onClick={() => setType("playlists")}
          className="flex-1"
        >
          <PlaySquare className="mr-2 h-4 w-4" />
          Playlists
        </Button>
      </div>

      <form
        onSubmit={form.handleSubmit((data) =>
          recommendationMutation.mutate({ ...data, type })
        )}
        className="space-y-4"
      >
        <Input
          placeholder="Describe your music preferences (e.g., chill 90s hip-hop with jazzy elements)"
          {...form.register("preferences")}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={recommendationMutation.isPending}
        >
          {recommendationMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Get Recommendations
        </Button>
      </form>

      {recommendationMutation.data?.recommendations && (
        <div className="space-y-4">
          {recommendationMutation.data.recommendations.map((rec, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">{rec.name}</h3>
                    {rec.artist && <p className="text-sm text-muted-foreground">{rec.artist}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.confidence_score && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        {Math.round(rec.confidence_score * 100)}%
                      </div>
                    )}
                    {type === "playlists" && user && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => saveMutation.mutate(rec)}
                        disabled={saveMutation.isPending}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {rec.description && (
                  <p className="text-sm mt-2">{rec.description}</p>
                )}

                {rec.genres && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {rec.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                )}

                {rec.mood && (
                  <Badge className="mt-2" variant="outline">
                    {rec.mood}
                  </Badge>
                )}

                <div className="flex gap-2 mt-4">
                  {rec.youtubeUrl && isValidUrl(rec.youtubeUrl) && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={rec.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        Watch on YouTube
                      </a>
                    </Button>
                  )}
                  {rec.spotifyUrl && isValidUrl(rec.spotifyUrl) && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={rec.spotifyUrl} target="_blank" rel="noopener noreferrer">
                        Open in Spotify
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}