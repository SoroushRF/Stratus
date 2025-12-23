"use client";

import { useState } from "react";
import { processSchedule } from "@/app/actions";
import { ParsedClass, University } from "@/types";
import universitiesData from "@/lib/data/universities.json";
import { getWeatherForecast } from "@/lib/services/weather";
import { matchClassesToWeather, filterClassesByDay, ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { resolveAnalysisDay, getDateForAnalysisDay } from "@/lib/utils/dateHelpers";

const universities = universitiesData as University[];

export default function Home() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
    const [selectedUniName, setSelectedUniName] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("today");
    const [error, setError] = useState<string | null>(null);

    // Generate day options based on current day
    const getDayOptions = () => {
        const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const today = new Date();
        const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        const options = [];
        
        // Add "Today (DayName)"
        options.push({ value: "today", label: `Today (${days[todayIndex]})` });
        
        // Add "Tomorrow (DayName)"
        const tomorrowIndex = (todayIndex + 1) % 7;
        options.push({ value: "tomorrow", label: `Tomorrow (${days[tomorrowIndex]})` });
        
        // Add next 5 days
        for (let i = 2; i < 7; i++) {
            const dayIndex = (todayIndex + i) % 7;
            const dayName = days[dayIndex];
            options.push({ value: dayName, label: dayName });
        }
        
        return options;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setStatus("loading");
        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const response = await processSchedule(base64Data, file.type);

                if (response.success && response.data) {
                    const parsedClasses = response.data;
                    setClasses(parsedClasses);

                    // Get selected university
                    const university = universities.find(u => u.name === selectedUniName);
                    if (!university) {
                        setStatus("error");
                        setError("Selected university not found.");
                        return;
                    }

                    // Resolve the analysis day and date
                    const actualDay = resolveAnalysisDay(selectedDay);
                    const analysisDate = getDateForAnalysisDay(selectedDay);

                    // Filter classes for the selected day
                    const dayClasses = filterClassesByDay(parsedClasses, actualDay);

                    if (dayClasses.length === 0) {
                        setStatus("error");
                        setError(`No classes found for ${getDayOptions().find(opt => opt.value === selectedDay)?.label || selectedDay}.`);
                        return;
                    }

                    // Fetch weather for the selected campus and date
                    const weatherData = await getWeatherForecast(
                        university.lat,
                        university.lng,
                        analysisDate
                    );

                    // Match classes to weather
                    const matches = matchClassesToWeather(dayClasses, weatherData);
                    setClassWeatherMatches(matches);

                    setStatus("success");
                } else {
                    setStatus("error");
                    setError(response.error || "Failed to parse schedule.");
                }
            };
        } catch (err) {
            setStatus("error");
            setError("Error reading file.");
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto", backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
            <h1 style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>Parser Test Dashboard</h1>
            
            {status !== "success" && (
                <div style={{ marginTop: "20px" }}>
                    <div style={{ marginBottom: "30px" }}>
                        <h3>1. Select Your Campus</h3>
                        <input 
                            list="universities" 
                            placeholder="Type to search campus..." 
                            value={selectedUniName}
                            onChange={(e) => setSelectedUniName(e.target.value)}
                            style={{ padding: "10px", border: "1px solid #ccc", width: "100%", outline: "none" }}
                        />
                        <datalist id="universities">
                            {universities.map((uni, idx) => (
                                <option key={idx} value={uni.name} />
                            ))}
                        </datalist>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h3>1.5. Select Analysis Day</h3>
                        <select 
                            value={selectedDay}
                            onChange={(e) => setSelectedDay(e.target.value)}
                            style={{ padding: "10px", border: "1px solid #ccc", width: "100%", outline: "none" }}
                        >
                            {getDayOptions().map((option, idx) => (
                                <option key={idx} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h3>2. Upload Schedule (PDF/Image)</h3>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            disabled={status === "loading" || !selectedUniName}
                            style={{ padding: "10px", border: "1px solid #ccc", width: "100%" }}
                        />
                        {!selectedUniName && <p style={{ fontSize: "12px", color: "#666" }}>* Select a campus first</p>}
                        {status === "loading" && <p><strong>Status: Processing with Gemini...</strong></p>}
                        {status === "error" && (
                            <div style={{ color: "red", padding: "10px", border: "1px solid red", marginTop: "10px" }}>
                                Error: {error}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {status === "success" && (
                <div style={{ marginTop: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <h2>Results</h2>
                            <p style={{ margin: 0, color: "#666" }}>Campus: {selectedUniName}</p>
                            <p style={{ margin: 0, color: "#666" }}>
                                Analysis Day: {getDayOptions().find(opt => opt.value === selectedDay)?.label || selectedDay}
                            </p>
                        </div>
                        <button onClick={() => setStatus("idle")} style={{ padding: "5px 15px", cursor: "pointer" }}>Upload New</button>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        {classWeatherMatches.length === 0 ? (
                            <p>No classes found for the selected day.</p>
                        ) : (
                            <div>
                                <h3 style={{ marginBottom: "15px" }}>Classes & Weather Conditions</h3>
                                {classWeatherMatches.map((match, idx) => (
                                    <div 
                                        key={idx} 
                                        style={{ 
                                            marginBottom: "15px", 
                                            padding: "15px", 
                                            backgroundColor: "#f9f9f9", 
                                            border: "1px solid #ddd",
                                            borderLeft: "4px solid #000" 
                                        }}
                                    >
                                        <h4 style={{ margin: "0 0 10px 0" }}>{match.class.name}</h4>
                                        
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px" }}>
                                            <div>
                                                <p style={{ margin: "5px 0" }}><strong>Time:</strong> {match.class.startTime} - {match.class.endTime}</p>
                                                <p style={{ margin: "5px 0" }}><strong>Location:</strong> {match.class.location || "N/A"}</p>
                                            </div>
                                            
                                            {match.weather ? (
                                                <div style={{ borderLeft: "2px solid #ccc", paddingLeft: "10px" }}>
                                                    <p style={{ margin: "5px 0" }}><strong>Weather:</strong> {match.weather.condition}</p>
                                                    <p style={{ margin: "5px 0" }}><strong>Temp:</strong> {match.weather.temp}°C (Feels like {match.weather.feelsLike}°C)</p>
                                                    <p style={{ margin: "5px 0" }}><strong>Wind:</strong> {match.weather.windSpeed} km/h</p>
                                                </div>
                                            ) : (
                                                <div style={{ borderLeft: "2px solid #ccc", paddingLeft: "10px" }}>
                                                    <p style={{ margin: "5px 0", color: "#999" }}>Weather data unavailable</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer style={{ marginTop: "50px", fontSize: "12px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
                Dev Mode: Engine Locked to Gemini 2.5 Flash Lite
            </footer>
        </div>
    );
}

