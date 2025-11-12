import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  to: string;
  captainName: string;
  teamName: string;
  leagueName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, captainName, teamName, leagueName }: ApprovalEmailRequest = await req.json();

    console.log("Sending approval email to:", to);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "3lab3 <onboarding@resend.dev>",
        to: [to],
        subject: `¡Equipo ${teamName} Aprobado!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FF6B00; text-align: center;">🎉 ¡Felicidades! Tu Equipo ha sido Aprobado</h1>
            <p>Hola <strong>${captainName}</strong>,</p>
            <p>¡Tenemos excelentes noticias! Tu equipo <strong>${teamName}</strong> ha sido oficialmente aprobado para participar en la liga <strong>${leagueName}</strong>.</p>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-left: 4px solid #FF6B00; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ya eres un equipo oficial de 3lab3</strong></p>
              <p style="margin: 10px 0 0 0; color: #666;">Puedes empezar a consultar tus partidos y estadísticas en el panel.</p>
            </div>
            
            <h3 style="color: #FF6B00;">¿Qué puedes hacer ahora?</h3>
            <ul>
              <li>Ver el calendario de partidos</li>
              <li>Consultar las estadísticas de tu equipo</li>
              <li>Seguir la clasificación de la liga</li>
            </ul>
            
            <p style="margin-top: 30px;">¡Mucha suerte en la temporada!</p>
            <p style="color: #666;">El equipo de 3lab3</p>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending approval email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
