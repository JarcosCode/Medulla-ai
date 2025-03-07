import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import RecommendationForm from "@/components/recommendation-form";
import TrendingSongs from "@/components/trending-songs";
import { Music2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b" role="banner">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold">Medulla.AI</h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/auth">Sign In</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8" role="main">
        <section className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-4xl font-bold mb-2">Your AI Music Companion</h2>
          <p className="text-lg text-muted-foreground mb-2">
            Get personalized music recommendations powered by AI.
          </p>
          <p className="text-sm text-muted-foreground">
            Create an account to unlock unlimited recommendations and playlists.
          </p>
        </section>

        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <section aria-labelledby="recommendations-heading">
            <h2 id="recommendations-heading" className="text-xl font-semibold mb-4">
              Get Recommendations
            </h2>
            <RecommendationForm />
          </section>

          <aside aria-labelledby="trending-heading">
            <TrendingSongs />
          </aside>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t" role="contentinfo">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by AI to help you discover your next favorite song.</p>
        </div>
      </footer>
    </div>
  );
}