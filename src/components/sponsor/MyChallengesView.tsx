import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export const MyChallengesView = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("sponsor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching challenges",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setChallenges(data || []);
    }
    setLoading(false);
  };

  const deleteChallenge = async (id: string) => {
    const { error } = await supabase
      .from("challenges")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error deleting challenge",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Challenge deleted",
        description: "The challenge has been removed successfully",
      });
      fetchChallenges();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your challenges...</div>;
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Challenges Yet</CardTitle>
          <CardDescription>
            Create your first challenge to start discovering talented AI builders
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                    {challenge.status}
                  </Badge>
                  <Badge variant="outline">{challenge.difficulty}</Badge>
                  <Badge variant="outline">{challenge.domain}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/challenge/${challenge.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteChallenge(challenge.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Deadline: {format(new Date(challenge.deadline), "MMM dd, yyyy")}</span>
              </div>
              {challenge.prize_amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>${challenge.prize_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>View Submissions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
