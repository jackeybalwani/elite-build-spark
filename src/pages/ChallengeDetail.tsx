import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, TrendingUp, ArrowLeft, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const urlSchema = z.string().url("Must be a valid URL");

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Form state
  const [repoUrl, setRepoUrl] = useState("");
  const [pitchDeckUrl, setPitchDeckUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    fetchChallenge();
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchChallenge = async () => {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "Error loading challenge",
        description: error.message,
        variant: "destructive",
      });
      navigate("/challenges");
    } else {
      setChallenge(data);
      await checkExistingSubmission();
    }
    setLoading(false);
  };

  const checkExistingSubmission = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("challenge_id", id)
      .eq("user_id", user.id)
      .single();

    if (data) {
      setHasSubmitted(true);
      setRepoUrl(data.repo_url);
      setPitchDeckUrl(data.pitch_deck_url || "");
      setVideoUrl(data.video_url || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit your solution",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Validate URLs
    try {
      urlSchema.parse(repoUrl);
      if (pitchDeckUrl) urlSchema.parse(pitchDeckUrl);
      if (videoUrl) urlSchema.parse(videoUrl);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid URL",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);

    const { error } = await supabase.from("submissions").insert({
      challenge_id: id,
      user_id: user.id,
      repo_url: repoUrl.trim(),
      pitch_deck_url: pitchDeckUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setHasSubmitted(true);
      toast({
        title: "Success!",
        description: "Your submission has been received and is being evaluated.",
      });
    }
  };

  const difficultyColors = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-accent/10 text-accent border-accent/20",
    advanced: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Challenge not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/challenges">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Challenges
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="font-medium">
                    {challenge.domain}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}
                  >
                    {challenge.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-3xl mb-2">{challenge.title}</CardTitle>
                <CardDescription className="text-base">
                  Sponsored by {challenge.sponsor_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Challenge Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{challenge.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(challenge.deadline), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Prize</p>
                      <p className="text-sm text-muted-foreground">
                        ${challenge.prize_amount?.toLocaleString() || "TBD"}
                      </p>
                    </div>
                  </div>
                </div>

                {challenge.prize_description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Prize Details</h3>
                    <p className="text-muted-foreground">{challenge.prize_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-card sticky top-24">
              <CardHeader>
                <CardTitle>Submit Your Solution</CardTitle>
                <CardDescription>
                  {hasSubmitted
                    ? "You've already submitted a solution for this challenge"
                    : "Provide your deliverables to compete"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="repo">
                      Repository URL <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="repo"
                      type="url"
                      placeholder="https://github.com/username/repo"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      required
                      disabled={hasSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deck">Pitch Deck URL</Label>
                    <Input
                      id="deck"
                      type="url"
                      placeholder="https://slides.com/your-deck"
                      value={pitchDeckUrl}
                      onChange={(e) => setPitchDeckUrl(e.target.value)}
                      disabled={hasSubmitted}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video">Demo Video URL</Label>
                    <Input
                      id="video"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={hasSubmitted}
                    />
                  </div>
                  {!hasSubmitted ? (
                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary shadow-primary"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Solution"}
                    </Button>
                  ) : (
                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-center">
                      <p className="text-success font-semibold">Submission received!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Check your profile for evaluation status
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
