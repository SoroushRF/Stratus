"use client";

import { motion } from "framer-motion";
import { Upload, Check, X } from "lucide-react";
import { useState, DragEvent } from "react";

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    uploadedFileName?: string;
    disabled?: boolean;
}

export default function FileUpload({ onFileSelect, uploadedFileName, disabled = false }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

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
        if (file) onFileSelect(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileSelect(file);
    };

    return (
        <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging ? "border-primary bg-primary/10" : "border-white/20 bg-white/5"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} backdrop-blur-sm`}
        >
            <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                onChange={handleFileInput}
                disabled={disabled}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="flex flex-col items-center gap-3">
                {uploadedFileName ? (
                    <>
                        <Check className="w-12 h-12 text-green-400" />
                        <p className="text-sm text-white/70">{uploadedFileName}</p>
                    </>
                ) : (
                    <>
                        <Upload className="w-12 h-12 text-white/40" />
                        <p className="text-white/70">Drop your schedule here or click to browse</p>
                        <p className="text-xs text-white/40">Supports PDF, PNG, JPG, TXT</p>
                    </>
                )}
            </div>
        </motion.div>
    );
}
