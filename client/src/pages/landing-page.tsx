import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import RecommendationForm from "@/components/recommendation-form";
import TrendingSongs from "@/components/trending-songs";
import { Music2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Medulla.AI</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Your AI Music Companion</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get personalized music recommendations powered by AI. Try it now for free - no account needed!
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account to unlock unlimited recommendations and playlists.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Get Recommendations</h2>
              <RecommendationForm />
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
