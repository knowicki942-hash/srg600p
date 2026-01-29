export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === "OPTIONS") return res.status(200).end();

    const { s, type, tno } = req.query;

    try {
        if (type === "trains") {
            const url = `https://panel.simrail.eu:8084/trains-open?serverCode=${s}`;
            const r = await fetch(url);
            const j = await r.json();
            return res.json({ data: j.data || j });
        } 

        if (type === "details") {
            // Pobieramy rozkład jazdy (timetable) z AWS
            const url = `https://api1.aws.simrail.eu:8082/api/getEDRTimetables?serverCode=${s}`;
            const r = await fetch(url);
            const j = await r.json();
            
            // Szukamy pociągu w rozkładzie
            const train = j.find(t => String(t.trainNoLocal) === String(tno));
            return res.json({ data: train });
        }

        return res.status(400).json({ error: "bad type" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
