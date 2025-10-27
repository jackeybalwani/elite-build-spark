import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();
    
    if (!submissionId) {
      throw new Error("submissionId is required");
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch submission with challenge details
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        challenges (
          title,
          description,
          difficulty,
          domain,
          rubric
        ),
        profiles (
          full_name
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError) throw submissionError;
    if (!submission) throw new Error("Submission not found");

    console.log("Evaluating submission:", submissionId);

    // Build evaluation prompt
    const prompt = `You are an expert technical evaluator for coding challenges.

Challenge: ${submission.challenges.title}
Domain: ${submission.challenges.domain}
Difficulty: ${submission.challenges.difficulty}
Description: ${submission.challenges.description}

Submission Details:
- Repository URL: ${submission.repo_url}
- Video Demo: ${submission.video_url || 'Not provided'}
- Pitch Deck: ${submission.pitch_deck_url || 'Not provided'}

Evaluation Criteria (Rubric):
${JSON.stringify(submission.challenges.rubric, null, 2)}

Please evaluate this submission and provide:
1. A detailed score breakdown for each rubric criterion (0-100 scale)
2. Overall feedback highlighting strengths and areas for improvement
3. A total score (weighted average based on rubric)
4. Specific technical observations

Format your response as a JSON object with this structure:
{
  "criteriaScores": {
    "criterion1": { "score": 85, "feedback": "..." },
    "criterion2": { "score": 90, "feedback": "..." }
  },
  "overallFeedback": "Detailed summary...",
  "totalScore": 87,
  "technicalObservations": ["observation1", "observation2"]
}`;

    // Call Lovable AI for evaluation
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a technical evaluator. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      throw new Error(`AI evaluation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const evaluationText = aiData.choices?.[0]?.message?.content;
    
    if (!evaluationText) {
      throw new Error("No evaluation received from AI");
    }

    // Parse AI response
    let evaluation;
    try {
      evaluation = JSON.parse(evaluationText);
    } catch (e) {
      console.error("Failed to parse AI response:", evaluationText);
      throw new Error("Invalid AI response format");
    }

    // Update submission with evaluation
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        score: Math.round(evaluation.totalScore),
        evaluation_feedback: evaluation,
        evaluated_at: new Date().toISOString(),
        status: 'evaluated'
      })
      .eq('id', submissionId);

    if (updateError) throw updateError;

    // Award badge if score is high enough
    if (evaluation.totalScore >= 80) {
      const { error: badgeError } = await supabase
        .from('badges')
        .insert({
          user_id: submission.user_id,
          challenge_id: submission.challenge_id,
          badge_type: evaluation.totalScore >= 95 ? 'gold' : evaluation.totalScore >= 85 ? 'silver' : 'bronze',
          metadata: { score: evaluation.totalScore }
        });

      if (badgeError) console.error("Badge award error:", badgeError);
    }

    // Update user career score
    const { error: profileError } = await supabase.rpc('increment', {
      row_id: submission.user_id,
      x: Math.round(evaluation.totalScore / 10)
    });

    if (profileError) console.error("Profile update error:", profileError);

    // Trigger email notification
    try {
      await supabase.functions.invoke('send-evaluation-email', {
        body: { 
          submissionId,
          builderName: submission.profiles.full_name,
          challengeTitle: submission.challenges.title,
          score: evaluation.totalScore
        }
      });
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

    console.log("Evaluation completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        score: evaluation.totalScore,
        evaluation 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in evaluate-submission:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
