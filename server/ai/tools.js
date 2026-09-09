export const toolSchemas = [
  {
    name: "get_weather",
    description:
      "Get the 7-day weather forecast (temperature, humidity, rain, wind) for the farmer's location. Use this when the farmer asks about weather, or when advising on planting, harvesting, spraying, or irrigation timing that depends on upcoming conditions.",
    input_schema: {
      type: "object",
      properties: {
        lat: {
          type: "number",
          description: "Latitude of the farmer's location",
        },
        lon: {
          type: "number",
          description: "Longitude of the farmer's location",
        },
      },
      required: ["lat", "lon"],
    },
  },
  {
    name: "get_price_trend",
    description:
      "Get recent mandi (market) price data and the price trend for a specific crop. Use this when the farmer asks whether prices are rising or falling, whether now is a good time to sell, or when current market conditions are relevant context for a planting decision.",
    input_schema: {
      type: "object",
      properties: {
        crop: {
          type: "string",
          description: "The crop/commodity to get price data for, e.g. 'Onion' or 'Tomato'",
        },
        state: {
          type: "string",
          description: "Indian state to fetch mandi prices for. Defaults to Maharashtra if not specified.",
        },
      },
      required: ["crop"],
    },
  },
  {
    name: "get_crop_calendar",
    description:
      "Returns the farmer's currently active (growing) crops — name, variety, area, planting date, and expected harvest date — for the logged-in farmer making the request. Does not include harvested or failed crops. Use this to check what land or crops the farmer already has in progress before recommending a new planting, e.g. 'is now a good time to plant onions' needs to know what's currently occupying their land.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_soil_requirements",
    description:
      "Returns the soil type, climate range, and water requirements for a specific crop — not the farmer's own crops. Use this when evaluating whether a crop is agronomically suitable for the farmer's conditions, or when comparing multiple candidate crops.",
    input_schema: {
      type: "object",
      properties: {
        crop: {
          type: "string",
          description: "The crop to look up soil/climate requirements for, e.g. 'Onion'",
        },
      },
      required: ["crop"],
    },
  },
];
