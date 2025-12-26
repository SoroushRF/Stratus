"use client";

import { motion } from "framer-motion";
import { Upload, Check, X, RotateCcw } from "lucide-react";
import { useState, DragEvent, useRef } from "react";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    uploadedFileName?: string;
    disabled?: boolean;
}

export default function FileUpload({ onFileSelect, uploadedFileName, disabled = false }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".txt"];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    const validateFile = (file: File): boolean => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        
        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            setError(`Format not supported. Please use PDF, PNG, JPG, or TXT.`);
            return false;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is 5MB.`);
            return false;
        }

        setError(null);
        return true;
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            onFileSelect(file);
        }
    };

    return (
        <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={!disabled && !error ? { scale: 1.01 } : {}}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging ? "border-primary bg-primary/10" : error ? "border-red-500 bg-red-500/10" : "border-white/20 bg-white/5"
            } ${disabled ? "opacity-50 cursor-not-allowed" : error ? "cursor-default" : "cursor-pointer"} backdrop-blur-sm`}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(",")}
                onChange={handleFileInput}
                disabled={disabled || !!error}
                className={`absolute inset-0 w-full h-full opacity-0 ${error ? "pointer-events-none" : "cursor-pointer"} disabled:cursor-not-allowed`}
            />

            <div className="flex flex-col items-center gap-3">
                {error ? (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                        <RotateCcw className="w-12 h-12 text-red-500" />
                        <p className="text-sm text-red-400 font-medium">{error}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setError(null);
                                // Small delay to let the state update before opening explorer
                                setTimeout(() => fileInputRef.current?.click(), 0);
                            }}
                            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold rounded-lg border border-red-500/50 transition-all cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                ) : uploadedFileName ? (
                    <>
                        <Check className="w-12 h-12 text-green-400" />
                        <p className="text-sm text-white/70">{uploadedFileName}</p>
                    </>
                ) : (
                    <>
                        <Upload className="w-12 h-12 text-white/40" />
                        <p className="text-white/70">Drop your schedule here or click to browse</p>
                        <p className="text-xs text-white/40">Supports PDF, PNG, JPG, TXT (Max 5MB)</p>
                    </>
                )}
            </div>
        </motion.div>
    );
}
