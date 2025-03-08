import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiYoutube } from "react-icons/si";
import { Film, Tv } from "lucide-react";
import PageTransition from "@/components/PageTransition";

export default function Landing() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Streamer Verse
            </h1>
            <p className="text-muted-foreground">Choose your streaming experience</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/youtube">
              <Card className="cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SiYoutube className="h-6 w-6 text-red-500" />
                    YouTube Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Search and watch YouTube videos with enhanced features like chapters,
                    watchlist, and recommendations.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/vidsrc">
              <Card className="cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Film className="h-6 w-6 text-primary" />
                      <Tv className="h-6 w-6 text-primary" />
                    </div>
                    Movies & TV Shows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Stream your favorite movies and TV shows from VidSrc's extensive
                    collection with high-quality playback.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}