const DAILY_API_URL = "https://api.daily.co/v1/rooms";

export async function createConsultRoom(appointmentId: string): Promise<string> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    throw new Error("DAILY_API_KEY no está configurada");
  }

  const res = await fetch(DAILY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: `consulta-${appointmentId}`,
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2
      }
    })
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`No se pudo crear la sala de video: ${detail}`);
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
