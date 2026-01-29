export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === "OPTIONS") return res.status(200).end();

    const { s, type, tno } = req.query;

    try {
        // Pobranie listy stacji
        if (type === "stations") {
            const url = `https://panel.simrail.eu:8084/stations-open?serverCode=${s}`;
            const r = await fetch(url);
            const j = await r.json();
            return res.json({ data: j.data || [] });
        }

        // Pobranie listy pociągów
        if (type === "trains") {
            const url = `https://panel.simrail.eu:8084/trains-open?serverCode=${s}`;
            const r = await fetch(url);
            const j = await r.json();
            return res.json({ data: j.data || [] });
        }

        // Szczegóły pociągu
        if (type === "details") {
            // Pobranie aktualnej listy pociągów i filtracja po numerze
            const url = `https://panel.simrail.eu:8084/trains-open?serverCode=${s}`;
            const r = await fetch(url);
            const j = await r.json();
            const train = (j.data || []).find(t => String(t.TrainNoLocal) === String(tno));
            if (!train) return res.status(404).json({ error: "Train not found" });

            // Przygotowanie prostego "timetable" z listy stacji (jeśli API nie daje pełnego rozkładu)
            const stationsUrl = `https://panel.simrail.eu:8084/stations-open?serverCode=${s}`;
            const stationsRes = await fetch(stationsUrl);
            const stationsData = await stationsRes.json();

            const timetable = stationsData.data.map(st => ({
                nameForPerson: st.Name,
                Lat: st.Latititude,
                Lon: st.Longitude,
                isActive: false, // opcjonalnie można ustawić na podstawie GPS pociągu
                departureTime: null
            }));

            return res.json({ 
                data: {
                    trainNoLocal: train.TrainNoLocal || train.trainNo,
                    endStation: train.EndStation || null,
                    status: { delayInSeconds: train.DelayInSeconds || 0 },
                    timetable
                }
            });
        }

        return res.status(400).json({ error: "bad type" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}

