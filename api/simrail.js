export default async function handler(req, res) {
    // Nagłówki CORS - bez tego strona na InfinityFree nie zadziała
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { s, type, tno } = req.query; // s = nazwa serwera (np. pl1), tno = numer pociągu

    let targetUrl = "";

    if (type === 'trains') {
        // Pobieramy listę pociągów z konkretnego serwera
        targetUrl = `https://api.simrail.app:8082/api/getTrains/${s}`;
    } else if (type === 'details') {
        // Pobieramy szczegóły konkretnego pociągu
        targetUrl = `https://api.simrail.app:8082/api/getTrain/${s}/${tno}`;
    } else {
        return res.status(400).json({ error: "Błędny typ zapytania" });
    }

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error('SimRail API nie odpowiada');
        const data = await response.json();
        
        // Wysyłamy czyste dane do Twojego HTMLa
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera Vercel", details: error.message });
    }
}
