import { CommuteMethod } from "./src/types/index.js";
import { getCommuteTime } from "./src/lib/services/commute.js";
import dotenv from "dotenv";

dotenv.config();

async function testGoogleMaps() {
  console.log("🚀 Testing Google Maps API...");
  console.log("API Key present:", !!process.env.GOOGLE_MAPS_API_KEY);

  // Test: CN Tower to UofT St. George Campus
  const origin = "43.6426,-79.3871"; 
  const destination = "43.6629,-79.3957";

  try {
    const time = await getCommuteTime(origin, destination, CommuteMethod.TRANSIT);
    console.log(`✅ Success! Estimated Transit time: ${time} minutes`);
    
    if (time === 15) {
      console.log("⚠️ Warning: Received exactly 15 minutes. This might be the fallback value if the API returned an error or is not fully enabled.");
    }
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
  }
}

testGoogleMaps();
