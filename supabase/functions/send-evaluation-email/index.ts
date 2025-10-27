import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationEmailRequest {
  submissionId: string;
  builderName: string;
  challengeTitle: string;
  score: number;
  builderEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId, builderName, challengeTitle, score, builderEmail }: EvaluationEmailRequest = await req.json();

    console.log("Sending evaluation email for submission:", submissionId);

    const emailResponse = await resend.emails.send({
      from: "EliteBuilders <onboarding@resend.dev>",
      to: builderEmail ? [builderEmail] : ["builder@example.com"], // Use actual email or fallback
      subject: `Your Challenge Submission Has Been Evaluated - ${challengeTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .score-badge { display: inline-block; background: ${score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}; color: white; padding: 15px 30px; border-radius: 50px; font-size: 24px; font-weight: bold; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Evaluation Complete!</h1>
            </div>
            <div class="content">
              <h2>Hi ${builderName},</h2>
              <p>Great news! Your submission for the <strong>${challengeTitle}</strong> challenge has been evaluated.</p>
              
              <div style="text-align: center;">
                <div class="score-badge">Score: ${score}/100</div>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Review detailed feedback in your dashboard</li>
                <li>Check your career score update</li>
                ${score >= 80 ? '<li>🏆 You earned a badge!</li>' : ''}
                <li>Apply lessons learned to future challenges</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://your-app.com'}/profile" class="button">
                  View Your Profile
                </a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Keep building amazing projects! 🚀
              </p>
            </div>
            <div class="footer">
              <p>EliteBuilders Challenge Platform</p>
              <p>Building the next generation of elite developers</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-evaluation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
