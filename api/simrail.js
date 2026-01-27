// api/simrail.js
export default async function handler(req, res) {
    // Te nagłówki naprawiają błąd CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { s, type, tno } = req.query;
    
    // Budujemy URL do serwera SimRail
    let url = `https://codrut666.github.io/SimRailLineData/${s}_trains.json`;
    if (type === 'details') {
        url = `https://codrut666.github.io/SimRailLineData/${s}_details_${tno}.json`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Błąd pobierania z SimRail');
        const data = await response.json();
        
        // Zwracamy dane do Twojej strony
        res.status(200).json({ data });
    } catch (error) {
        // Jeśli tu wpadnie, Vercel wyśle 500 - upewnij się, że URL powyżej jest poprawny!
        res.status(500).json({ error: error.message });
    }
}
