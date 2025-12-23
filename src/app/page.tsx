"use client";

import { useState } from "react";
import { processSchedule, generateAttireRecommendationsAction, generateMasterRecommendationAction } from "@/app/actions";
import { ParsedClass, University, ClassAttireRecommendation, MasterRecommendation } from "@/types";
import universitiesData from "@/lib/data/universities.json";
import { getWeatherForecast } from "@/lib/services/weather";
import { matchClassesToWeather, filterClassesByDay, ClassWeatherMatch } from "@/lib/utils/weatherMatcher";
import { resolveAnalysisDay, getDateForAnalysisDay } from "@/lib/utils/dateHelpers";

const universities = universitiesData as University[];

export default function Home() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [loadingStep, setLoadingStep] = useState<string>("");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [classWeatherMatches, setClassWeatherMatches] = useState<ClassWeatherMatch[]>([]);
    const [classAttireRecommendations, setClassAttireRecommendations] = useState<ClassAttireRecommendation[]>([]);
    const [masterRecommendation, setMasterRecommendation] = useState<MasterRecommendation | null>(null);
    const [collapsedClasses, setCollapsedClasses] = useState<Set<number>>(new Set());
    const [selectedUniName, setSelectedUniName] = useState<string>("");
    const [selectedDay, setSelectedDay] = useState<string>("today");
    const [error, setError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);

    // Helper functions
    const getWeatherIcon = (condition: string): string => {
        const c = condition.toLowerCase();
        if (c.includes("clear") || c.includes("sun")) return "☀️";
        if (c.includes("cloud")) return "☁️";
        if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
        if (c.includes("snow")) return "❄️";
        if (c.includes("thunder") || c.includes("storm")) return "⛈️";
        return "🌤️";
    };

    const getTempLabel = (temp: number): string => {
        if (temp < 0) return "FREEZING";
        if (temp < 10) return "COLD";
        if (temp < 20) return "MILD";
        if (temp < 30) return "WARM";
        return "HOT";
    };

    const toggleClass = (idx: number) => {
        const newCollapsed = new Set(collapsedClasses);
        if (newCollapsed.has(idx)) {
            newCollapsed.delete(idx);
        } else {
            newCollapsed.add(idx);
        }
        setCollapsedClasses(newCollapsed);
    };

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

        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const mimeType = file.type;
                setUploadedFile({ base64: base64Data, mimeType, name: file.name });
            };
        } catch (err) {
            setError("Error reading file.");
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setStatus("loading");
        setError(null);

        try {
            setLoadingStep("Parsing schedule with AI...");

            const response = await processSchedule(uploadedFile.base64, uploadedFile.mimeType);

            if (response.success && response.data) {
                const parsedClasses = response.data;
                setClasses(parsedClasses);

                // Find selected university
                const university = universities.find(u => u.name === selectedUniName);
                if (!university) {
                    setStatus("error");
                    setError("Selected university not found. Please select a valid campus from the list.");
                    setLoadingStep("");
                    return;
                }

                // Resolve the analysis day and date
                const actualDay = resolveAnalysisDay(selectedDay);
                const analysisDate = getDateForAnalysisDay(selectedDay);

                // Filter classes for the selected day
                const dayClasses = filterClassesByDay(parsedClasses, actualDay);

                if (dayClasses.length === 0) {
                    setStatus("error");
                    setError(`No classes found for ${getDayOptions().find(opt => opt.value === selectedDay)?.label || selectedDay}. Try selecting a different day.`);
                    setLoadingStep("");
                    return;
                }

                // Fetch weather
                setLoadingStep(`Fetching weather data for ${university.shortName}...`);
                let weatherData;
                try {
                    weatherData = await getWeatherForecast(
                        university.lat,
                        university.lng,
                        analysisDate
                    );
                } catch (weatherError) {
                    console.error("Weather fetch failed:", weatherError);
                    setStatus("error");
                    setError("Failed to fetch weather data. Please try again.");
                    setLoadingStep("");
                    return;
                }

                // Match classes to weather
                const matches = matchClassesToWeather(dayClasses, weatherData);
                setClassWeatherMatches(matches);

                // Check if we have any weather data
                const hasWeatherData = matches.some(m => m.weather !== null);
                if (!hasWeatherData) {
                    setStatus("error");
                    setError("No weather data available for the selected date. The date might be outside the available range.");
                    setLoadingStep("");
                    return;
                }

                // Generate attire recommendations
                setLoadingStep(`Generating clothing recommendations (${matches.length} classes)...`);
                const attireResponse = await generateAttireRecommendationsAction(matches);
                
                if (attireResponse.success && attireResponse.data) {
                    setClassAttireRecommendations(attireResponse.data);
                    
                    // Generate master recommendation
                    setLoadingStep("Creating master outfit recommendation...");
                    const masterResponse = await generateMasterRecommendationAction(attireResponse.data);
                    
                    if (masterResponse.success && masterResponse.data) {
                        setMasterRecommendation(masterResponse.data);
                    } else {
                        console.error("Failed to generate master recommendation:", masterResponse.error);
                        // Continue anyway - individual recommendations are still useful
                    }
                } else {
                    console.error("Failed to generate recommendations:", attireResponse.error);
                    setStatus("error");
                    setError("Failed to generate clothing recommendations. Please try again.");
                    setLoadingStep("");
                    return;
                }

                setStatus("success");
                setLoadingStep("");
            } else {
                setStatus("error");
                setError(response.error || "Failed to parse schedule. Make sure the file contains a valid schedule.");
                setLoadingStep("");
            }
        } catch (err) {
            console.error("Analysis error:", err);
            setStatus("error");
            setError("Error during analysis. Please try again.");
            setLoadingStep("");
        }
    };

    return (
        <div style={{ padding: "40px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto", backgroundColor: "#fff", color: "#000", minHeight: "100vh" }}>
            <h1 style={{ borderBottom: "2px solid #000", paddingBottom: "10px" }}>Parser Test Dashboard</h1>
            
            {status !== "success" && (
                <div style={{ marginTop: "20px" }}>
                    <div style={{ marginBottom: "30px" }}>
                        <h3>Select Your Campus</h3>
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
                        <h3>Select Analysis Day</h3>
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
                        <h3>Upload Schedule (PDF/Image)</h3>
                        <input 
                            type="file" 
                            onChange={handleFileChange} 
                            disabled={status === "loading" || !selectedUniName}
                            accept="image/*,application/pdf"
                            style={{ padding: "10px", border: "1px solid #ccc", width: "100%" }}
                        />
                        {!selectedUniName && <p style={{ fontSize: "12px", color: "#666" }}>* Select a campus first</p>}
                        {uploadedFile && (
                            <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f0f0f0", border: "1px solid #ccc" }}>
                                <p style={{ margin: 0, fontSize: "14px" }}>✅ File uploaded: <strong>{uploadedFile.name}</strong></p>
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: "30px" }}>
                        <h3>Ready to Analyze</h3>
                        <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                            {!selectedUniName || !uploadedFile 
                                ? "Complete the steps above to enable analysis."
                                : "Review your selections above. You can change the campus, day, or upload a different file before analyzing."
                            }
                        </p>
                        <button
                            onClick={handleAnalyze}
                            disabled={status === "loading" || !selectedUniName || !uploadedFile}
                            style={{
                                padding: "15px 30px",
                                fontSize: "16px",
                                fontWeight: "bold",
                                backgroundColor: (status === "loading" || !selectedUniName || !uploadedFile) ? "#ccc" : "#000",
                                color: (status === "loading" || !selectedUniName || !uploadedFile) ? "#999" : "#fff",
                                border: "none",
                                cursor: (status === "loading" || !selectedUniName || !uploadedFile) ? "not-allowed" : "pointer",
                                width: "100%",
                                transition: "all 0.2s ease"
                            }}
                        >
                            {status === "loading" ? "Analyzing..." : "🚀 Analyze Schedule"}
                        </button>
                    </div>

                    {status === "loading" && (
                        <div style={{ marginTop: "15px", padding: "15px", border: "2px solid #000", backgroundColor: "#f0f0f0" }}>
                            <p style={{ margin: "0 0 10px 0" }}><strong>Processing...</strong></p>
                            {loadingStep && (
                                <p style={{ margin: "0", fontSize: "14px" }}>
                                    ⏳ {loadingStep}
                                </p>
                            )}
                        </div>
                    )}
                    {status === "error" && (
                        <div style={{ marginTop: "15px", padding: "15px", border: "2px solid #d32f2f", backgroundColor: "#ffebee", color: "#d32f2f" }}>
                            <p style={{ margin: "0 0 5px 0" }}><strong>❌ Error</strong></p>
                            <p style={{ margin: "0", fontSize: "14px" }}>{error}</p>
                            <button 
                                onClick={() => setStatus("idle")}
                                style={{ marginTop: "10px", padding: "5px 15px", cursor: "pointer", backgroundColor: "#fff", border: "1px solid #d32f2f", color: "#d32f2f" }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}
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
                        {classAttireRecommendations.length === 0 ? (
                            <p>No classes found for the selected day.</p>
                        ) : (
                            <div>
                                {/* Master Recommendation - Hero Element */}
                                {masterRecommendation && (
                                    <div style={{
                                        marginBottom: "30px",
                                        padding: "25px",
                                        background: "white",
                                        color: "black",
                                        border: "2px solid #000",
                                        borderRadius: "8px"
                                    }}>
                                        <h3 style={{ margin: "0 0 15px 0", fontSize: "24px" }}>
                                            🎯 Master Outfit for the Day
                                        </h3>
                                        
                                        <div style={{ marginBottom: "15px" }}>
                                            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.7 }}>
                                                TEMPERATURE RANGE
                                            </p>
                                            <p style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}>
                                                {masterRecommendation.weatherRange.minTemp}°C → {masterRecommendation.weatherRange.maxTemp}°C
                                            </p>
                                            <p style={{ margin: "5px 0 0 0", fontSize: "14px", opacity: 0.7 }}>
                                                Conditions: {masterRecommendation.weatherRange.conditions.join(", ")}
                                            </p>
                                        </div>

                                        <div style={{ marginBottom: "15px" }}>
                                            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.7 }}>
                                                BASE OUTFIT
                                            </p>
                                            <p style={{ margin: "0", fontSize: "16px" }}>
                                                {masterRecommendation.baseOutfit}
                                            </p>
                                        </div>

                                        <div style={{ marginBottom: "15px" }}>
                                            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.7 }}>
                                                LAYERING STRATEGY
                                            </p>
                                            <p style={{ margin: "0", fontSize: "16px" }}>
                                                {masterRecommendation.layeringStrategy}
                                            </p>
                                        </div>

                                        {masterRecommendation.essentialAccessories.length > 0 && (
                                            <div style={{ marginBottom: "15px" }}>
                                                <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.7 }}>
                                                    ESSENTIAL ACCESSORIES
                                                </p>
                                                <p style={{ margin: "0", fontSize: "16px" }}>
                                                    {masterRecommendation.essentialAccessories.join(" • ")}
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ 
                                            marginTop: "15px", 
                                            paddingTop: "15px", 
                                            borderTop: "1px solid #ddd"
                                        }}>
                                            <p style={{ margin: "0", fontSize: "14px", fontStyle: "italic", opacity: 0.7 }}>
                                                💡 {masterRecommendation.reasoning}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <h3 style={{ marginBottom: "15px" }}>
                                    Class Details ({classAttireRecommendations.length} classes)
                                </h3>
                                {classAttireRecommendations.map((rec, idx) => {
                                    const isCollapsed = collapsedClasses.has(idx);
                                    return (
                                        <div 
                                            key={idx} 
                                            style={{ 
                                                marginBottom: "15px", 
                                                padding: "15px", 
                                                backgroundColor: "#f9f9f9", 
                                                border: "1px solid #ddd",
                                                borderLeft: rec.attire.priority === "essential" ? "4px solid #d32f2f" : "4px solid #000"
                                            }}
                                        >
                                            {/* Class Header - Always Visible */}
                                            <div 
                                                onClick={() => toggleClass(idx)}
                                                style={{ cursor: "pointer", userSelect: "none" }}
                                            >
                                                <h4 style={{ margin: "0 0 5px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span>{rec.class.name}</span>
                                                    <span style={{ fontSize: "14px", fontWeight: "normal" }}>
                                                        {isCollapsed ? "▼ Show Details" : "▲ Hide Details"}
                                                    </span>
                                                </h4>
                                                <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                                                    {rec.class.startTime} - {rec.class.endTime}
                                                    {rec.weather && ` • ${getWeatherIcon(rec.weather.condition)} ${rec.weather.temp}°C (${getTempLabel(rec.weather.temp)})`}
                                                </p>
                                            </div>

                                            {/* Expandable Details */}
                                            {!isCollapsed && (
                                                <div style={{ marginTop: "15px" }}>
                                                    {/* Class & Weather Info */}
                                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "14px", marginBottom: "15px" }}>
                                                        <div>
                                                            <p style={{ margin: "5px 0" }}><strong>Location:</strong> {rec.class.location || "N/A"}</p>
                                                        </div>
                                                        
                                                        {rec.weather ? (
                                                            <div style={{ borderLeft: "2px solid #ccc", paddingLeft: "10px" }}>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    <strong>Weather:</strong> {getWeatherIcon(rec.weather.condition)} {rec.weather.condition}
                                                                </p>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    <strong>Feels Like:</strong> {rec.weather.feelsLike}°C
                                                                </p>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    <strong>Wind:</strong> {rec.weather.windSpeed} km/h
                                                                </p>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    <strong>Humidity:</strong> {rec.weather.humidity}%
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div style={{ borderLeft: "2px solid #ccc", paddingLeft: "10px" }}>
                                                                <p style={{ margin: "5px 0", color: "#999" }}>Weather data unavailable</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Attire Recommendation */}
                                                    <div style={{ 
                                                        padding: "12px", 
                                                        backgroundColor: rec.attire.priority === "essential" ? "#ffebee" : "#e8f5e9",
                                                        borderRadius: "4px",
                                                        borderLeft: rec.attire.priority === "essential" ? "3px solid #d32f2f" : "3px solid #4caf50"
                                                    }}>
                                                        <p style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "15px" }}>
                                                            👔 Recommended Attire
                                                            {rec.attire.priority === "essential" && <span style={{ color: "#d32f2f", marginLeft: "8px" }}>(Essential)</span>}
                                                        </p>
                                                        <p style={{ margin: "5px 0" }}>{rec.attire.recommendation}</p>
                                                        <p style={{ margin: "5px 0", fontSize: "13px", fontStyle: "italic", color: "#666" }}>
                                                            {rec.attire.reasoning}
                                                        </p>
                                                        {rec.attire.accessories.length > 0 && (
                                                            <p style={{ margin: "8px 0 0 0", fontSize: "13px" }}>
                                                                <strong>Bring:</strong> {rec.attire.accessories.join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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

