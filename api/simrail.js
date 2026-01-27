export default async function handler(req, res) {
  // Pobieramy parametry: s (serwer), t (pociąg), type (rodzaj danych)
  const { s = 'pl3', t = '', type = 'trains' } = req.query;
  
  let targetUrl = "";

  if (type === 'trains') {
    // Lista pociągów na serwerze (np. PL3)
    targetUrl = `https://panel.simrail.eu:8084/trains-open?serverCode=${s}`;
  } else if (type === 'timetable') {
    // Rozkład konkretnego pociągu
    targetUrl = `https://api1.aws.simrail.eu:8082/api/getAllTimetables?serverCode=${s}&train=${t}`;
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    // Nagłówki CORS dla InfinityFree
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Błąd SimRail API" });
  }
}
