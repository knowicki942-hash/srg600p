export default async function handler(req, res) {
  // Pobieramy parametry: s (server), t (train), type (co chcemy pobrać)
  const { s = 'en1', t = '', type = 'trains' } = req.query;
  
  let targetUrl = "";

  // Wybór odpowiedniego adresu API SimRail
  if (type === 'trains') {
    // Lista wszystkich pociągów na danym serwerze
    targetUrl = `https://panel.simrail.eu:8084/trains-open?serverCode=${s}`;
  } else if (type === 'timetable') {
    // Szczegółowy rozkład konkretnego pociągu
    targetUrl = `https://api1.aws.simrail.eu:8082/api/getAllTimetables?serverCode=${s}&train=${t}`;
  } else if (type === 'servers') {
    // Lista dostępnych serwerów
    targetUrl = `https://panel.simrail.eu:8084/servers-open`;
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Błąd komunikacji z SimRail API" });
  }
}