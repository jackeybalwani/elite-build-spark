import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ChallengeWizard = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [deadline, setDeadline] = useState("");

  // Step 2: Rubric
  const [technicalWeight, setTechnicalWeight] = useState(25);
  const [innovationWeight, setInnovationWeight] = useState(25);
  const [businessWeight, setBusinessWeight] = useState(25);
  const [presentationWeight, setPresentationWeight] = useState(25);
  const [rubricGuidance, setRubricGuidance] = useState("");

  // Step 3: Prize & Branding
  const [prizeAmount, setPrizeAmount] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [sponsorName, setSponsorName] = useState("");

  // Step 4: Review
  const [status, setStatus] = useState<"draft" | "active">("draft");

  const totalWeight = technicalWeight + innovationWeight + businessWeight + presentationWeight;

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description || !domain || !difficulty || !deadline) {
        toast({
          title: "Missing fields",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    if (step === 2 && totalWeight !== 100) {
      toast({
        title: "Invalid rubric",
        description: "Weights must sum to 100%",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a challenge",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const rubric = {
      technical: technicalWeight,
      innovation: innovationWeight,
      business: businessWeight,
      presentation: presentationWeight,
      guidance: rubricGuidance,
    };

    const { error } = await supabase.from("challenges").insert({
      title,
      description,
      domain,
      difficulty,
      deadline,
      rubric,
      prize_amount: prizeAmount ? parseInt(prizeAmount) : null,
      prize_description: prizeDescription || null,
      sponsor_name: sponsorName,
      sponsor_id: user.id,
      status,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error creating challenge",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Challenge created!",
        description: status === "active" ? "Your challenge is now live" : "Challenge saved as draft",
      });
      navigate("/sponsor-dashboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Challenge</CardTitle>
        <CardDescription>Step {step} of 4</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Build an AI-Powered Code Review Assistant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe the challenge requirements, goals, and evaluation criteria..."
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NLP">Natural Language Processing</SelectItem>
                    <SelectItem value="Computer Vision">Computer Vision</SelectItem>
                    <SelectItem value="ML Ops">ML Operations</SelectItem>
                    <SelectItem value="Generative AI">Generative AI</SelectItem>
                    <SelectItem value="Data Engineering">Data Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Submission Deadline *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Rubric */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Customize evaluation weights (must sum to 100%). Total: {totalWeight}%
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label className="w-32">Technical</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={technicalWeight}
                  onChange={(e) => setTechnicalWeight(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32">Innovation</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={innovationWeight}
                  onChange={(e) => setInnovationWeight(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32">Business</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={businessWeight}
                  onChange={(e) => setBusinessWeight(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-4">
                <Label className="w-32">Presentation</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={presentationWeight}
                  onChange={(e) => setPresentationWeight(parseInt(e.target.value) || 0)}
                  className="w-24"
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="guidance">Evaluation Guidance (Optional)</Label>
              <Textarea
                id="guidance"
                placeholder="Provide specific criteria or guidance for LLM evaluation..."
                rows={4}
                value={rubricGuidance}
                onChange={(e) => setRubricGuidance(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Prize & Branding */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorName">Company Name *</Label>
              <Input
                id="sponsorName"
                placeholder="Your company name"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizeAmount">Prize Amount (USD)</Label>
              <Input
                id="prizeAmount"
                type="number"
                placeholder="e.g., 5000"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prizeDescription">Prize Description</Label>
              <Textarea
                id="prizeDescription"
                placeholder="Describe the prize structure, additional rewards, or opportunities..."
                rows={4}
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-semibold text-lg">{title}</h3>
              <div className="flex gap-2">
                <span className="text-sm px-2 py-1 bg-secondary rounded">{domain}</span>
                <span className="text-sm px-2 py-1 bg-secondary rounded">{difficulty}</span>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="text-sm">
                <p><strong>Deadline:</strong> {new Date(deadline).toLocaleDateString()}</p>
                {prizeAmount && <p><strong>Prize:</strong> ${parseInt(prizeAmount).toLocaleString()}</p>}
                <p><strong>Sponsor:</strong> {sponsorName}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={status} onValueChange={(v: "draft" | "active") => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft</SelectItem>
                  <SelectItem value="active">Publish Now</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || loading}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              <Check className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Challenge"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
