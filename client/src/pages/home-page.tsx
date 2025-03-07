import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import RecommendationForm from "@/components/recommendation-form";
import TrendingSongs from "@/components/trending-songs";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookmarkIcon } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: limits } = useQuery({
    queryKey: ["/api/daily-limits"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MusicAI</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/saved-playlists">
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Saved Playlists
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Get Recommendations</h2>
              <RecommendationForm limits={limits} />
            </section>
          </div>

          <div>
            <TrendingSongs />
          </div>
        </div>
      </main>
    </div>
  );
}