import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Award, TrendingUp, Github, Globe, FileText, Edit, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile(user.id);
    fetchSubmissions(user.id);
    fetchBadges(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProfile(data);
      setFullName(data.full_name || "");
      setGithubUrl(data.github_url || "");
      setPortfolioUrl(data.portfolio_url || "");
    }
    setLoading(false);
  };

  const fetchSubmissions = async (userId: string) => {
    const { data, error } = await supabase
      .from("submissions")
      .select("*, challenges(*)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
    } else {
      setSubmissions(data || []);
    }
  };

  const fetchBadges = async (userId: string) => {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .eq("user_id", userId)
      .order("awarded_at", { ascending: false });

    if (error) {
      console.error("Error fetching badges:", error);
    } else {
      setBadges(data || []);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        github_url: githubUrl,
        portfolio_url: portfolioUrl,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
      setEditing(false);
      fetchProfile(profile.id);
    }
  };

  const badgeLabels: Record<string, string> = {
    top_10_percent: "Top 10%",
    category_winner: "Category Winner",
    sponsor_favorite: "Sponsor Favorite",
    first_submission: "First Submission",
    streak_3: "3-Challenge Streak",
    streak_10: "10-Challenge Streak",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-accent/10 text-accent border-accent/20",
    evaluating: "bg-primary/10 text-primary border-primary/20",
    scored: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-2xl">
                      {profile.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-3xl mb-1">{profile.full_name || "Anonymous Builder"}</CardTitle>
                    <CardDescription className="text-base capitalize">{profile.role}</CardDescription>
                  </div>
                </div>
                <Button
                  variant={editing ? "default" : "outline"}
                  onClick={() => (editing ? handleSave() : setEditing(true))}
                  disabled={saving}
                >
                  {editing ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Saving..." : "Save"}
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-2xl font-bold">{profile.career_score}</span>
                <span className="text-muted-foreground">Career Score</span>
              </div>

              <Separator />

              {editing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub URL</Label>
                    <Input
                      id="github"
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio URL</Label>
                    <Input
                      id="portfolio"
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub Profile</span>
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:underline"
                    >
                      <Globe className="h-5 w-5" />
                      <span>Portfolio</span>
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {badges.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-accent" />
                  Badges & Achievements
                </CardTitle>
                <CardDescription>Your earned recognition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <Badge
                      key={badge.id}
                      variant="outline"
                      className="px-4 py-2 text-base bg-accent/10 text-accent border-accent/20"
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      {badgeLabels[badge.badge_type] || badge.badge_type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>
                {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No submissions yet. Start by browsing challenges!
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">
                              {submission.challenges?.title || "Challenge"}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Submitted {format(new Date(submission.submitted_at), "MMM dd, yyyy")}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <a
                                href={submission.repo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center"
                              >
                                <Github className="mr-1 h-4 w-4" />
                                Repository
                              </a>
                              {submission.score && (
                                <span className="font-semibold text-success">
                                  Score: {submission.score}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={statusColors[submission.status]}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
