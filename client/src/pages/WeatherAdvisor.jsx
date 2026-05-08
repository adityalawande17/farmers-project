import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

const WEATHER_ICONS = {
  "clear sky": "☀️",
  "few clouds": "🌤",
  "scattered clouds": "⛅",
  "broken clouds": "☁️",
  "overcast clouds": "☁️",
  "light rain": "🌦",
  "moderate rain": "🌧",
  "heavy intensity rain": "⛈",
  thunderstorm: "⛈",
  snow: "❄️",
  mist: "🌫",
  haze: "🌫",
  fog: "🌫",
  sunny: "☀️",
  "partly cloudy": "⛅",
  "hot and dry": "🌡",
};

const getIcon = (desc = "") => {
  const key = Object.keys(WEATHER_ICONS).find((k) =>
    desc.toLowerCase().includes(k),
  );
  return WEATHER_ICONS[key] || "🌤";
};

export default function WeatherAdvisor() {
  const { user } = useAuth();
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");
  const [aiAdvice, setAiAdvice] = useState([]);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [askAdvice, setAskAdvice] = useState("");
  const [askLoading, setAskLoading] = useState(false);

  // Fetch real weather using saved coordinates or browser GPS
  useEffect(() => {
    const fetchWeather = (lat, lon) => {
      axios
        .get(`${API}/prices/weather?lat=${lat}&lon=${lon}`)
        .then((res) => {
          setForecast(res.data.forecast || []);
          setCity(res.data.city || "");
        })
        .catch(() =>
          setWeatherError(
            "Could not fetch weather. Check your OpenWeatherMap API key.",
          ),
        )
        .finally(() => setLoading(false));
    };

    if (user?.coordinates?.lat) {
      fetchWeather(user.coordinates.lat, user.coordinates.lon);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          setWeatherError(
            "Location permission denied. Please allow location access to see weather.",
          );
          setLoading(false);
        },
      );
    }
  }, [user]);

  // Generate real AI advice once forecast is loaded
  useEffect(() => {
    if (forecast.length === 0) return;
    setAdviceLoading(true);

    const forecastSummary = forecast
      .slice(0, 5)
      .map(
        (d) =>
          `${d.date}: ${d.temp}°C, ${d.description}, rain: ${d.rain}mm, humidity: ${d.humidity}%, wind: ${d.wind}km/h`,
      )
      .join("\n");

    const crops = user?.crops?.join(", ") || "general crops";
    const location = city || user?.location?.district || "your location";

    axios
      .post(`${API}/ai/chat`, {
        messages: [
          {
            role: "user",
            content: `You are a farming advisor for a farmer in ${location} who grows ${crops}.

Here is the real 5-day weather forecast:
${forecastSummary}

Based ONLY on this actual forecast data, give exactly 4 specific farming advisories as a JSON array:
[{"icon":"emoji","color":"blue|green|amber|red","title":"short title","body":"specific advice based on the actual temperatures and rain data above"}]

Each advisory must reference actual numbers from the forecast (temperatures, rain mm, specific days).
Categories to cover: irrigation, spraying/pest, heat/cold stress, and sowing/harvesting timing.
Return only the JSON array, nothing else.`,
          },
        ],
        context: { crops: user?.crops || [], location },
      })
      .then((res) => {
        try {
          const text = res.data.reply.replace(/```json|```/g, "").trim();
          setAiAdvice(JSON.parse(text));
        } catch {
          setAiAdvice([]);
        }
      })
      .catch(() => setAiAdvice([]))
      .finally(() => setAdviceLoading(false));
  }, [forecast]);

  const askWeatherQuestion = async () => {
    if (!question.trim() || forecast.length === 0) return;
    setAskLoading(true);
    setAskAdvice("");
    try {
      const forecastSummary = forecast
        .slice(0, 5)
        .map(
          (d) => `${d.date}: ${d.temp}°C, ${d.description}, rain: ${d.rain}mm`,
        )
        .join(" | ");

      const { data } = await axios.post(`${API}/ai/chat`, {
        messages: [
          {
            role: "user",
            content: `Farmer in ${city || "India"} asks: ${question}
          
Real weather forecast: ${forecastSummary}

Answer specifically using the actual forecast data above.`,
          },
        ],
        context: { location: city, crops: user?.crops || [] },
      });
      setAskAdvice(data.reply);
    } catch {
      setAskAdvice("Could not get advice. Please try again.");
    } finally {
      setAskLoading(false);
    }
  };

  const colorMap = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    green: "bg-green-50 border-green-100 text-green-800",
    amber: "bg-amber-50 border-amber-100 text-amber-800",
    red: "bg-red-50 border-red-100 text-red-800",
  };

  const today = forecast[0];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-medium text-gray-900">
          Weather Advisor
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Real-time forecast + AI farming recommendations for your location
        </p>
      </div>

      {/* Error state */}
      {weatherError && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
          {weatherError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">
            Fetching your local weather...
          </span>
        </div>
      )}

      {!loading && forecast.length > 0 && (
        <>
          {/* Today hero card */}
          {today && (
            <div className="bg-green-500 text-white rounded-2xl p-6 mb-6 flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80 mb-1">
                  {city} · {today.date}
                </div>
                <div className="text-4xl font-serif font-medium">
                  {today.temp}°C
                </div>
                <div className="text-sm opacity-90 mt-1 capitalize">
                  {today.description}
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl mb-2">
                  {getIcon(today.description)}
                </div>
                <div className="text-sm opacity-80 flex flex-col gap-0.5">
                  <div>💧 Humidity: {today.humidity}%</div>
                  <div>🌬 Wind: {today.wind} km/h</div>
                  {today.rain > 0 && <div>🌧 Rain: {today.rain}mm</div>}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 7-day forecast */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                {forecast.length}-Day Forecast · {city}
              </h2>
              <div className="flex flex-col gap-1">
                {forecast.map((day, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3 w-28">
                      <span className="text-lg">
                        {getIcon(day.description)}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {i === 0
                          ? "Today"
                          : new Date(day.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "numeric",
                            })}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize flex-1 text-center">
                      {day.description}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        {day.temp}°C
                      </span>
                      {day.rain > 0 && (
                        <div className="text-xs text-blue-500">
                          {day.rain}mm rain
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advice */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-700">
                    AI Farming Advice
                  </h2>
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                    Based on real forecast
                  </span>
                </div>

                {adviceLoading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-14 bg-gray-50 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : aiAdvice.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {aiAdvice.map((a, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${colorMap[a.color] || colorMap.green}`}
                      >
                        <div className="text-xs font-semibold mb-1">
                          {a.icon} {a.title}
                        </div>
                        <div className="text-xs leading-relaxed opacity-90">
                          {a.body}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-gray-400">
                    Could not generate advice. Please try again later.
                  </div>
                )}
              </div>

              {/* Ask AI */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Ask About This Week's Weather
                </h2>
                <div className="flex gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !askLoading && askWeatherQuestion()
                    }
                    placeholder="e.g. Should I spray pesticide this week?"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-green-400 transition-colors"
                  />
                  <button
                    onClick={askWeatherQuestion}
                    disabled={askLoading || !question.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
                  >
                    Ask
                  </button>
                </div>
                {askLoading && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                )}
                {askAdvice && (
                  <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-xs text-green-800 leading-relaxed">
                      {askAdvice}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
