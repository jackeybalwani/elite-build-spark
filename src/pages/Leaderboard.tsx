import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Leaderboard() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "builder")
      .order("career_score", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Error fetching leaderboard",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBuilders(data || []);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-accent" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="h-5 w-5 text-[#CD7F32]" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-accent/10 text-accent border-accent/20";
    if (rank === 2) return "bg-muted/10 text-muted-foreground border-muted/20";
    if (rank === 3) return "bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20";
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Global Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Top AI builders ranked by career score across all challenges
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : builders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No builders on the leaderboard yet.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {builders.map((builder, index) => {
              const rank = index + 1;
              const rankIcon = getRankIcon(rank);
              const rankBadge = getRankBadge(rank);

              return (
                <Card
                  key={builder.id}
                  className={`transition-all duration-300 hover:shadow-card hover:-translate-y-1 ${
                    rank <= 3 ? "border-2" : ""
                  } ${rankBadge}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12">
                          {rankIcon || (
                            <span className="text-2xl font-bold text-muted-foreground">
                              {rank}
                            </span>
                          )}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                            {builder.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {builder.full_name || "Anonymous Builder"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {builder.github_url ? (
                              <a
                                href={builder.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                View GitHub Profile
                              </a>
                            ) : (
                              "No GitHub profile"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-success" />
                          <span className="text-2xl font-bold text-foreground">
                            {builder.career_score}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Career Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
