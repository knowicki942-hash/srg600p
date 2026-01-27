export default async function handler(req, res) {
    // 1. Zawsze ustawiamy nagłówki na samym początku
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Obsługa pre-flight dla przeglądarek
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { s, type, tno } = req.query;

    if (!s || !type) {
        return res.status(400).json({ error: "Brak parametrów s lub type" });
    }

    let targetUrl = "";
    if (type === 'trains') {
        targetUrl = `https://api.simrail.app:8082/api/getTrains/${s}`;
    } else if (type === 'details') {
        targetUrl = `https://api.simrail.app:8082/api/getTrain/${s}/${tno}`;
    }

    try {
        // Używamy timeoutu, żeby Vercel nie wisiał w nieskończoność
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(targetUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(response.status).json({ error: `API SimRail zwróciło błąd ${response.status}` });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Błąd API:", error.message);
        return res.status(500).json({ 
            error: "Błąd połączenia z serwerem SimRail", 
            details: error.message 
        });
    }
}
