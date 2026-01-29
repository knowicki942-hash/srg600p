export default async function handler(req, res) {

  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { s, type, tno } = req.query;
  const baseUrl = "https://panel.simrail.eu:8084";
  let targetUrl = "";

  if (type === "trains" || type === "details") {
    targetUrl = `${baseUrl}/trains-open?serverCode=${s}`;
  } else if (type === "positions") {
    targetUrl = `${baseUrl}/train-positions-open?serverCode=${s}`;
  } else if (type === "stations") {
    targetUrl = `${baseUrl}/stations-open?serverCode=${s}`;
  }

  try {
    const response = await fetch(targetUrl);
    const json = await response.json();

    const trains = Array.isArray(json)
      ? json
      : Array.isArray(json.data)
        ? json.data
        : [];

    if (type === "details" && tno) {
      const train = trains.find(
        t => String(t.trainNo) === String(tno) ||
             String(t.trainNoLocal) === String(tno)
      );

      return res.status(200).json({
        result: true,
        data: train || null
      });
    }

    return res.status(200).json({
      result: true,
      data: trains,
      count: trains.length
    });

  } catch (e) {
    return res.status(500).json({
      result: false,
      error: e.message
    });
  }
}
