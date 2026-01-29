export default async function handler(req, res) {

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { s, type, tno } = req.query;
  const base = "https://panel.simrail.eu:8084";
  let url = "";

  if (type === "trains" || type === "details") {
    url = `${base}/trains-open?serverCode=${s}`;
  } else {
    return res.status(400).json({ error: "bad type" });
  }

  const r = await fetch(url);
  const j = await r.json();

  const trains = Array.isArray(j)
    ? j
    : Array.isArray(j.data)
      ? j.data
      : [];

  if (type === "details") {
    const train = trains.find(
      t => String(t.TrainNoLocal) === String(tno)
    );
    return res.json({ data: train });
  }

  res.json({ data: trains });
}
