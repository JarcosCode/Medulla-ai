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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#111827] to-[#1f2937]">
      <header className="border-b border-white/10">
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

      <main className="container mx-auto px-4 py-8 flex-1">
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

      <footer className="bg-black text-white py-4 w-full">
        <div className="container mx-auto px-4 text-center">
          <p>Feel free to reach out to us, email us at: <a href="mailto:Demarco@foodHost.us" className="hover:underline">Demarco@foodHost.us</a></p>
        </div>
      </footer>
    </div>
  );
}