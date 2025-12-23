export const getForecastForTime = async (location: string, time: string) => {
  // logic to fetch from OpenWeather
  console.log(`Fetching weather for ${location} at ${time}`);
  return {
    temp: 0,
    condition: "Unknown",
    precipChance: 0,
  };
};
