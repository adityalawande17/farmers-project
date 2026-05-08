import express from "express";
import axios from "axios";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/prices?state=Maharashtra&commodity=Tomato
router.get("/", protect, async (req, res) => {
  try {
    const { state = "Maharashtra", commodity } = req.query;

    const params = new URLSearchParams({
      "api-key": process.env.DATA_GOV_API_KEY,
      format: "json",
      limit: "50",
      offset: "0",
      "filters[state]": state,
    });

    if (commodity) {
      params.append("filters[commodity]", commodity);
    }

    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const normalized = data.records.map((r) => ({
      commodity: r.commodity,
      variety: r.variety,
      state: r.state,
      district: r.district,
      market: r.market,
      min_price: r.min_price,
      max_price: r.max_price,
      modal_price: r.modal_price,
      arrival_date: r.arrival_date,
    }));

    res.json(normalized);
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      message: "Failed to fetch prices",
    });
  }
});

// GET /api/prices/weather?lat=18.5&lon=73.8
router.get("/weather", protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon)
      return res.status(400).json({ message: "lat and lon required" });

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&cnt=7`;
    const { data } = await axios.get(url);

    const forecast = data.list.map((item) => ({
      date: item.dt_txt.split(" ")[0],
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      description: item.weather[0].description,
      rain: item.rain?.["3h"] || 0,
      wind: Math.round(item.wind.speed),
    }));

    res.json({ city: data.city.name, forecast });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
