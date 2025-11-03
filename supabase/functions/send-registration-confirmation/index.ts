import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  to: string;
  captainName: string;
  teamName: string;
  leagueName: string;
  numberOfPlayers: number;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, captainName, teamName, leagueName, numberOfPlayers, totalAmount }: RegistrationEmailRequest = await req.json();

    console.log("Sending registration confirmation to:", to);

    const emailResponse = await resend.emails.send({
      from: "3lab3 <onboarding@resend.dev>",
      to: [to],
      subject: `Registro de Equipo: ${teamName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B00; text-align: center;">¡Registro Recibido!</h1>
          <p>Hola <strong>${captainName}</strong>,</p>
          <p>Hemos recibido tu solicitud de registro para el equipo <strong>${teamName}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Detalles del Registro</h2>
            <p><strong>Equipo:</strong> ${teamName}</p>
            <p><strong>Liga:</strong> ${leagueName}</p>
            <p><strong>Número de Jugadores:</strong> ${numberOfPlayers}</p>
            <p><strong>Total a Pagar:</strong> ${totalAmount}€</p>
          </div>
          
          <h3 style="color: #FF6B00;">Próximos Pasos:</h3>
          <ol>
            <li>Realiza el pago del registro</li>
            <li>Espera la aprobación del administrador</li>
            <li>Recibirás un email de confirmación cuando tu equipo sea oficial</li>
          </ol>
          
          <p style="margin-top: 30px;">¡Gracias por unirte a 3lab3!</p>
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
    console.error("Error sending registration email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
