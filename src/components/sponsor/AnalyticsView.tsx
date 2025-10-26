import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Users, Trophy, DollarSign } from "lucide-react";

export const AnalyticsView = () => {
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalSubmissions: 0,
    averageScore: 0,
    totalPrizeAwarded: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch challenges count
    const { data: challenges } = await supabase
      .from("challenges")
      .select("id, prize_amount")
      .eq("sponsor_id", user.id);

    const totalChallenges = challenges?.length || 0;
    const challengeIds = challenges?.map(c => c.id) || [];

    // Fetch submissions count and average score
    const { data: submissions } = await supabase
      .from("submissions")
      .select("score")
      .in("challenge_id", challengeIds);

    const totalSubmissions = submissions?.length || 0;
    const scores = submissions?.filter(s => s.score !== null).map(s => s.score) || [];
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Calculate total prize (simplified - in production would track actual awards)
    const totalPrizeAwarded = challenges?.reduce((sum, c) => sum + (c.prize_amount || 0), 0) || 0;

    setStats({
      totalChallenges,
      totalSubmissions,
      averageScore,
      totalPrizeAwarded,
    });
    
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
            <p className="text-xs text-muted-foreground">Active and completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Across all challenges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}/100</div>
            <p className="text-xs text-muted-foreground">Submission quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prize Pool</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalPrizeAwarded.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Detailed analytics and charts coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Advanced analytics features will be available soon, including:</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>• Submission trends over time</li>
              <li>• Score distribution charts</li>
              <li>• Builder engagement metrics</li>
              <li>• Challenge performance comparison</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
