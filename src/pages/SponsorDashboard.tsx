import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserRole } from "@/hooks/useUserRole";
import { MyChallengesView } from "@/components/sponsor/MyChallengesView";
import { ChallengeWizard } from "@/components/sponsor/ChallengeWizard";
import { SubmissionsView } from "@/components/sponsor/SubmissionsView";
import { AnalyticsView } from "@/components/sponsor/AnalyticsView";
import { Loader2 } from "lucide-react";

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const { isSponsor, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isSponsor) {
      navigate("/");
    }
  }, [isSponsor, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSponsor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Sponsor Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your challenges, review submissions, and discover top talent
          </p>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="challenges">My Challenges</TabsTrigger>
            <TabsTrigger value="create">Create Challenge</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <MyChallengesView />
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <ChallengeWizard />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <SubmissionsView />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
