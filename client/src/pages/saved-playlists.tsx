import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Music2, Trash2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SavedPlaylist } from "@shared/schema";

export default function SavedPlaylistsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: playlists, isLoading } = useQuery<SavedPlaylist[]>({
    queryKey: ["/api/playlists"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      await apiRequest("DELETE", `/api/playlists/${playlistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist deleted",
        description: "The playlist has been removed from your saved items.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete playlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#111827] to-[#1f2937]">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Saved Playlists</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.username}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {playlists?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                You haven't saved any playlists yet. Get some recommendations to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playlists?.map((playlist) => (
              <Card key={playlist.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{playlist.name}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(playlist.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {playlist.description}
                  </p>

                  {playlist.genres && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {playlist.genres.map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {playlist.mood && (
                    <Badge variant="outline" className="mb-4">
                      {playlist.mood}
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    {playlist.youtubeUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={playlist.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch on YouTube
                        </a>
                      </Button>
                    )}
                    {playlist.spotifyUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a
                          href={playlist.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
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
      </main>

      <footer className="bg-black text-white py-4 w-full">
        <div className="container mx-auto px-4 text-center">
          <p>Feel free to reach out to us, email us at: <a href="mailto:Demarco@foodHost.us" className="hover:underline">Demarco@foodHost.us</a></p>
        </div>
      </footer>
    </div>
  );
}