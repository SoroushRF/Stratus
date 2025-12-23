
async function testGoogleMaps() {
  const apiKey = "YOUR_KEY_ALREADY_IN_ENV"; // We'll pull from env
  const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;
  
  console.log("🚀 Testing Google Maps API...");
  console.log("API Key present:", !!GOOGLE_MAPS_KEY);

  // CN Tower to UofT
  const origin = "43.6426,-79.3871"; 
  const destination = "43.6629,-79.3957";
  const mode = "transit";

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&mode=${mode}&key=${GOOGLE_MAPS_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
      const mins = Math.round(data.rows[0].elements[0].duration.value / 60);
      console.log(`✅ Success! Google says it takes ${mins} minutes by transit.`);
    } else {
      console.log("❌ API Error Detail:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ Fetch Failed:", error.message);
  }
}

testGoogleMaps();
