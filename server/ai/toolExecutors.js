import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Crop from "../models/Crop.js";

// --- Scaffolded (extracted from prices.js — same logic, just callable directly) ---

export async function getWeather(lat, lon) {
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

  return { city: data.city.name, forecast };
}

export async function getPriceTrend(crop, state = "Maharashtra") {
  const params = new URLSearchParams({
    "api-key": process.env.DATA_GOV_API_KEY,
    format: "json",
    limit: "50",
    offset: "0",
    "filters[state]": state,
    "filters[commodity]": crop,
  });

  const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`;
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  return data.records.map((r) => ({
    commodity: r.commodity,
    variety: r.variety,
    market: r.market,
    min_price: r.min_price,
    max_price: r.max_price,
    modal_price: r.modal_price,
    arrival_date: r.arrival_date,
  }));
}

// --- Yours to write ---

export async function getCropCalendar(userId) {
  const crops = await Crop.find({ user: userId, status: "growing" })
    .select("name variety area plantingDate expectedHarvestDate season")
    .lean();

  return crops;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const soilDataPath = path.join(__dirname, "soilData.json");

export async function getSoilRequirements(crop) {
  const rawData = await fs.readFile(soilDataPath, "utf-8");
  const soilData = JSON.parse(rawData);

  const cropKey = crop.trim().toLowerCase();
  const requirements = soilData[cropKey];

  if (!requirements) {
    return {
      crop,
      found: false,
      message: `I don't have soil requirement data for ${crop}.`,
    };
  }

  return {
    crop: cropKey,
    found: true,
    ...requirements,
  };
}
