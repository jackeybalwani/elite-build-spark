import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  deadline: string;
  sponsorName: string;
  prizeAmount?: number;
}

export const ChallengeCard = ({
  id,
  title,
  description,
  domain,
  difficulty,
  deadline,
  sponsorName,
  prizeAmount,
}: ChallengeCardProps) => {
  const difficultyColors = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-accent/10 text-accent border-accent/20",
    advanced: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="font-medium">
            {domain}
          </Badge>
          <Badge
            variant="outline"
            className={difficultyColors[difficulty as keyof typeof difficultyColors]}
          >
            {difficulty}
          </Badge>
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {format(new Date(deadline), "MMM dd, yyyy")}
            </div>
            <div className="flex items-center text-foreground font-semibold">
              <Trophy className="mr-2 h-4 w-4 text-accent" />
              ${prizeAmount?.toLocaleString() || "TBD"}
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            Sponsored by {sponsorName}
          </div>
          <Button asChild className="w-full mt-4 bg-gradient-primary shadow-primary">
            <Link to={`/challenge/${id}`}>View Challenge</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
