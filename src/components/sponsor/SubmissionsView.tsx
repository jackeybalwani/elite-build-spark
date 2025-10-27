import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Download, Mail } from "lucide-react";
import { format } from "date-fns";

export const SubmissionsView = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch sponsor's challenges
    const { data: challengesData } = await supabase
      .from("challenges")
      .select("id, title")
      .eq("sponsor_id", user.id);

    if (challengesData) {
      setChallenges(challengesData);
      
      const challengeIds = challengesData.map(c => c.id);
      
      // Fetch submissions for sponsor's challenges
      const { data: submissionsData, error } = await supabase
        .from("submissions")
        .select(`
          *,
          profiles:user_id (
            full_name,
            github_url,
            portfolio_url,
            cv_url
          ),
          challenges:challenge_id (
            title
          )
        `)
        .in("challenge_id", challengeIds)
        .order("submitted_at", { ascending: false });

      if (error) {
        toast({
          title: "Error fetching submissions",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSubmissions(submissionsData || []);
      }
    }
    
    setLoading(false);
  };

  const filteredSubmissions = selectedChallenge === "all"
    ? submissions
    : submissions.filter(s => s.challenge_id === selectedChallenge);

  const downloadCandidatePacket = (submission: any) => {
    const packet = {
      builderName: submission.profiles?.full_name || 'Unknown',
      challengeTitle: submission.challenges?.title || 'Unknown',
      submissionDate: new Date(submission.submitted_at).toLocaleDateString(),
      repoUrl: submission.repo_url,
      videoUrl: submission.video_url,
      pitchDeckUrl: submission.pitch_deck_url,
      score: submission.score,
      status: submission.status,
      evaluationFeedback: submission.evaluation_feedback,
    };

    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-${submission.user_id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download complete",
      description: "Candidate information has been downloaded",
    });
  };

  const handleEvaluateSubmission = async (submissionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-submission', {
        body: { submissionId }
      });

      if (error) throw error;

      toast({
        title: "Evaluation started",
        description: "The submission is being evaluated by our AI system",
      });

      // Refresh submissions
      await fetchData();
    } catch (error: any) {
      console.error('Error evaluating submission:', error);
      toast({
        title: "Evaluation failed",
        description: error.message || "Failed to start evaluation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>Review and manage submissions to your challenges</CardDescription>
            </div>
            <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="All Challenges" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Challenges</SelectItem>
                {challenges.map((challenge) => (
                  <SelectItem key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet for the selected challenge
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Builder</TableHead>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {submission.profiles?.full_name || "Anonymous"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {submission.challenges?.title}
                    </TableCell>
                    <TableCell>
                      {submission.score ? (
                        <Badge variant={submission.score >= 80 ? "default" : "secondary"}>
                          {submission.score}/100
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Evaluated</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          submission.status === "evaluated"
                            ? "default"
                            : submission.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(submission.submitted_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {submission.repo_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={submission.repo_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {submission.status === 'pending' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleEvaluateSubmission(submission.id)}
                          >
                            Evaluate
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadCandidatePacket(submission)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          title="Messaging coming soon"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
