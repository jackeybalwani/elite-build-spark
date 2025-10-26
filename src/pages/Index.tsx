import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Code2, Users, Sparkles, Award, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Compete. Build. Get Hired.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              The competitive arena where AI builders showcase real-world skills and companies
              discover exceptional talent through validated challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-primary shadow-primary text-lg px-8 py-6"
              >
                <Link to="/challenges">Browse Challenges</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                <Link to="/leaderboard">View Leaderboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-none shadow-card">
              <CardHeader>
                <Trophy className="h-12 w-12 mx-auto mb-4 text-accent" />
                <CardTitle className="text-3xl font-bold">$25K+</CardTitle>
                <CardDescription className="text-base">Total Prize Pool</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-none shadow-card">
              <CardHeader>
                <Code2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <CardTitle className="text-3xl font-bold">4</CardTitle>
                <CardDescription className="text-base">Active Challenges</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-none shadow-card">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto mb-4 text-success" />
                <CardTitle className="text-3xl font-bold">3</CardTitle>
                <CardDescription className="text-base">Hiring Partners</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to showcase your AI building skills
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-card hover:shadow-primary transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>1. Choose a Challenge</CardTitle>
                <CardDescription className="text-base">
                  Browse company-sponsored challenges across different AI domains and difficulty
                  levels
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card hover:shadow-accent transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center mb-4">
                  <Code2 className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>2. Build & Submit</CardTitle>
                <CardDescription className="text-base">
                  Create your AI-powered MVP with repo, pitch deck, and demo video. Get automated
                  LLM evaluation
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card hover:shadow-primary transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>3. Win & Get Hired</CardTitle>
                <CardDescription className="text-base">
                  Earn badges, climb leaderboards, win prizes, and get discovered by top tech
                  companies
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why EliteBuilders?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A platform designed for AI builders and hiring companies
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-card">
              <CardHeader>
                <TrendingUp className="h-8 w-8 mb-4 text-primary" />
                <CardTitle className="text-2xl">Real-World Validation</CardTitle>
                <CardDescription className="text-base">
                  Showcase your ability to build complete AI products, not just code snippets.
                  Automated LLM scoring ensures fair evaluation.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <Trophy className="h-8 w-8 mb-4 text-accent" />
                <CardTitle className="text-2xl">Competitive Recognition</CardTitle>
                <CardDescription className="text-base">
                  Earn badges like Top 10%, Category Winner, and Sponsor Favorite. Build your
                  career score across challenges.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <Users className="h-8 w-8 mb-4 text-success" />
                <CardTitle className="text-2xl">Direct Hiring Pipeline</CardTitle>
                <CardDescription className="text-base">
                  Companies get early access to your submissions. Skip traditional interviews and
                  prove your skills through working products.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <Award className="h-8 w-8 mb-4 text-primary" />
                <CardTitle className="text-2xl">Prize Pool & Opportunities</CardTitle>
                <CardDescription className="text-base">
                  Compete for cash prizes, job interviews, contract opportunities, and mentorship
                  programs from leading tech companies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Showcase Your AI Skills?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join EliteBuilders today and start competing in AI challenges. Build your portfolio,
              earn recognition, and get hired.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary shadow-primary text-lg px-8 py-6"
            >
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 EliteBuilders. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
