export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const { s, type, tno } = req.query; 
    // s = serwer (np. en1, pl3), type = trains / positions / stations

    let targetUrl = "";
    const baseUrl = "https://panel.simrail.eu:8084";

    if (type === 'trains') {
        targetUrl = `${baseUrl}/trains-open?serverCode=${s}`;
    } else if (type === 'positions') {
        targetUrl = `${baseUrl}/train-positions-open?serverCode=${s}`;
    } else if (type === 'stations') {
        targetUrl = `${baseUrl}/stations-open?serverCode=${s}`;
    } else if (type === 'details') {
        // Uwaga: getTrain (detale) zazwyczaj jest na starym API lub w trains-open szukamy po ID
        targetUrl = `${baseUrl}/trains-open?serverCode=${s}`; 
    }

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`SimRail Panel zwrócił błąd: ${response.status}`);
        
        const data = await response.json();
        
        // Jeśli szukamy detali konkretnego pociągu (tno)
        if (type === 'details' && tno) {
            const trainDetails = data.data.find(t => t.trainNo === tno || t.trainNoLocal === tno);
            return res.status(200).json({ data: trainDetails });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ 
            error: "Błąd połączenia z panelem SimRail", 
            details: error.message 
        });
    }
}
