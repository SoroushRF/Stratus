"use client";

import { useState } from "react";
import { processSchedule } from "@/app/actions";
import { ParsedClass } from "@/types";

export default function Home() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [classes, setClasses] = useState<ParsedClass[]>([]);
    const [error, setError] = useState<string | null>(null);

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
                    setClasses(response.data);
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
                    <h3>Upload Schedule (PDF/Image)</h3>
                    <input 
                        type="file" 
                        onChange={handleFileChange} 
                        disabled={status === "loading"}
                        style={{ padding: "10px", border: "1px solid #ccc", width: "100%" }}
                    />
                    {status === "loading" && <p><strong>Status: Processing with Gemini...</strong></p>}
                    {status === "error" && (
                        <div style={{ color: "red", padding: "10px", border: "1px solid red", marginTop: "10px" }}>
                            Error: {error}
                        </div>
                    )}
                </div>
            )}

            {status === "success" && (
                <div style={{ marginTop: "30px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2>Results</h2>
                        <button onClick={() => setStatus("idle")} style={{ padding: "5px 15px", cursor: "pointer" }}>Upload New</button>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        {(() => {
                            const grouped = classes.reduce((acc, cls) => {
                                if (!acc[cls.name]) acc[cls.name] = [];
                                acc[cls.name].push(cls);
                                return acc;
                            }, {} as Record<string, ParsedClass[]>);

                            const courseNames = Object.keys(grouped);

                            if (courseNames.length === 0) return <p>No classes found.</p>;

                            return courseNames.map((name, i) => (
                                <details key={i} style={{ border: "1px solid #000", marginBottom: "10px", padding: "10px" }}>
                                    <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                                        {name} ({grouped[name].length} sessions)
                                    </summary>
                                    <div style={{ marginTop: "10px", paddingLeft: "15px" }}>
                                        {grouped[name].map((instance, idx) => (
                                            <div key={idx} style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f0f0f0", borderLeft: "4px solid #000" }}>
                                                <p><strong>Time:</strong> {instance.startTime} - {instance.endTime}</p>
                                                <p><strong>Days:</strong> {instance.days?.join(", ") || "N/A"}</p>
                                                <p><strong>Location:</strong> {instance.location || "N/A"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            ));
                        })()}
                    </div>
                </div>
            )}

            <footer style={{ marginTop: "50px", fontSize: "12px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
                Dev Mode: Engine Locked to Gemini 2.5 Flash Lite
            </footer>
        </div>
    );
}

