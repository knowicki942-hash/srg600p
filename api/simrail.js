export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === "OPTIONS") return res.status(200).end();

    const { s, type } = req.query;

    try {
        if(type === "trains-full") {
            // 1. Lista pociągów
            const trainsR = await fetch(`https://panel.simrail.eu:8084/trains-open?serverCode=${s}`);
            const trains = await trainsR.json();

            // 2. Lista stacji
            const stationsR = await fetch(`https://panel.simrail.eu:8084/stations-open?serverCode=${s}`);
            const stations = await stationsR.json();

            // 3. Szczegóły rozkładu dla każdego pociągu
            const detailedTrains = await Promise.all(trains.data.map(async t => {
                const timetableR = await fetch(`https://api1.aws.simrail.eu:8082/api/getEDRTimetables?serverCode=${s}`);
                const timetableData = await timetableR.json();
                const trainDetail = timetableData.find(td => String(td.trainNoLocal) === String(t.TrainNoLocal));
                if(!trainDetail) return null;

                // Scalanie stacji z timetable
                const fullTimetable = (trainDetail.timetable || []).map((stop, idx) => {
                    const stationInfo = stations.data.find(st => st.Name === stop.nameForPerson);
                    return {
                        indexOfPoint: idx,
                        nameForPerson: stop.nameForPerson,
                        pointId: stationInfo?.id || null,
                        Latititude: stationInfo?.Latititude || stop.Lat || null,
                        Longitude: stationInfo?.Longitude || stop.Lon || null,
                        arrivalTime: stop.arrivalTime || null,
                        actualArrivalTime: stop.actualArrivalTime || null,
                        departureTime: stop.departureTime || null,
                        actualDepartureTime: stop.actualDepartureTime || null,
                        plannedStop: stop.plannedStop || 0
                    };
                });

                // Aktualna pozycja pociągu (ostatnia stacja aktywna lub pierwsza)
                const activeStop = fullTimetable.find(st => st.actualDepartureTime && !st.actualArrivalTime) || fullTimetable[0];
                return {
                    TrainNoLocal: t.TrainNoLocal,
                    TrainName: t.TrainName || t.TrainNoLocal,
                    StartStation: fullTimetable[0]?.nameForPerson || "",
                    EndStation: fullTimetable[fullTimetable.length-1]?.nameForPerson || "",
                    ServerCode: s,
                    Latitude: activeStop?.Latititude || 0,
                    Longitude: activeStop?.Longitude || 0,
                    timetable: fullTimetable
                };
            }));

            res.json(detailedTrains.filter(Boolean));
            return;
        }

        res.status(400).json({ error: "bad type" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}
