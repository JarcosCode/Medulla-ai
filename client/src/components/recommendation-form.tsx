import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Music, PlaySquare } from "lucide-react";

type RecommendationFormProps = {
  limits?: {
    songRecsCount: number;
    playlistRecsCount: number;
  };
};

export default function RecommendationForm({ limits }: RecommendationFormProps) {
  const { toast } = useToast();
  const [type, setType] = useState<"songs" | "playlists">("songs");
  const form = useForm({
    defaultValues: {
      preferences: "",
    },
  });

  const recommendationMutation = useMutation({
    mutationFn: async (data: { preferences: string; type: "songs" | "playlists" }) => {
      const res = await apiRequest("POST", "/api/recommendations", data);
      return res.json();
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

  const maxSongs = 5;
  const maxPlaylists = 3;

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
          placeholder="Describe your music preferences (e.g., chill 90s hip-hop)"
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
                <h3 className="font-semibold">{rec.name}</h3>
                {rec.artist && <p className="text-sm text-muted-foreground">{rec.artist}</p>}
                {rec.description && (
                  <p className="text-sm mt-2">{rec.description}</p>
                )}
                <div className="flex gap-2 mt-4">
                  {rec.youtubeUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={rec.youtubeUrl} target="_blank" rel="noopener noreferrer">
                        YouTube
                      </a>
                    </Button>
                  )}
                  {rec.spotifyUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={rec.spotifyUrl} target="_blank" rel="noopener noreferrer">
                        Spotify
                      </a>
                    </Button>
                  )}
                  {rec.appleMusicUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={rec.appleMusicUrl} target="_blank" rel="noopener noreferrer">
                        Apple Music
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