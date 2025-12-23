"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { processSchedule } from "@/app/actions";

interface ScheduleUploadProps {
    onParsed: (classes: any[]) => void;
}

export function ScheduleUpload({ onParsed }: ScheduleUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/"))) {
            setFile(droppedFile);
            handleUpload(droppedFile);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            handleUpload(selectedFile);
        }
    };

    const handleUpload = async (file: File) => {
        setStatus("uploading");
        setError(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(",")[1];
                const response = await processSchedule(base64Data, file.type);

                if (response.success && response.data) {
                    setStatus("success");
                    onParsed(response.data);
                } else {
                    setStatus("error");
                    setError(response.error || "Could not parse schedule.");
                }
            };
        } catch (err) {
            setStatus("error");
            setError("Error processing file.");
        }
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setError(null);
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`relative group cursor-pointer transition-all duration-300 rounded-3xl border-2 border-dashed p-12 text-center
          ${isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }
          ${file ? "border-solid border-white/20" : ""}
        `}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".pdf,image/*"
                />

                {!file ? (
                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Upload Your Schedule</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop your PDF or Image (JPEG/PNG) here,<br />
                                or click to browse your files.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-4 p-4 glass rounded-2xl">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-semibold truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    reset();
                                }}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {status === "uploading" && (
                            <div className="flex items-center justify-center gap-3 text-primary animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Parsing with Gemini AI...</span>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="flex items-center justify-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">Schedule Parsed Successfully!</span>
                            </div>
                        )}

                        {status === "error" && (
                            <div className="flex items-center justify-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale pointer-events-none">
                <p className="text-xs font-medium uppercase tracking-widest">Powered By</p>
                <div className="flex items-center gap-4 italic font-bold">
                    <span>Gemini AI</span>
                    <span>OpenWeather</span>
                </div>
            </div>
        </div>
    );
}
