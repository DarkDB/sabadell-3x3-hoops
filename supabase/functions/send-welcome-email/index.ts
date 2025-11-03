import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  to: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, fullName }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", to);

    const emailResponse = await resend.emails.send({
      from: "3lab3 <onboarding@resend.dev>",
      to: [to],
      subject: "¡Bienvenido a 3lab3!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B00; text-align: center;">¡Bienvenido a 3lab3!</h1>
          <p>Hola <strong>${fullName}</strong>,</p>
          <p>Gracias por registrarte en nuestra plataforma de gestión de ligas de baloncesto.</p>
          <p>Ya puedes empezar a:</p>
          <ul>
            <li>Inscribir tu equipo en las ligas disponibles</li>
            <li>Consultar los partidos programados</li>
            <li>Ver las estadísticas de tu equipo</li>
          </ul>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p style="margin-top: 30px;">¡Nos vemos en la cancha!</p>
          <p style="color: #666;">El equipo de 3lab3</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
