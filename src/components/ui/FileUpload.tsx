"use client";

import { motion } from "framer-motion";
import { Upload, FileCheck, AlertCircle } from "lucide-react";

interface FileUploadProps {
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadedFileName?: string;
    disabled?: boolean;
    status: "idle" | "loading" | "success" | "error";
}

export default function FileUpload({ onFileChange, uploadedFileName, disabled, status }: FileUploadProps) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">Schedule</h3>
            <label className={`
        relative flex flex-col items-center justify-center w-full h-40 
        border-2 border-dashed rounded-2xl cursor-pointer transition-all
        ${uploadedFileName ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadedFileName ? (
                        <>
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-3 rounded-full bg-primary/20 mb-3">
                                <FileCheck className="w-8 h-8 text-primary" />
                            </motion.div>
                            <p className="text-sm text-white font-medium">{uploadedFileName}</p>
                            <p className="text-xs text-white/50 mt-1">File ready for analysis</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-white/5 mb-3">
                                <Upload className="w-8 h-8 text-white/50" />
                            </div>
                            <p className="text-sm text-white/70">
                                <span className="font-semibold text-white">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-white/40 mt-1">PDF or image of your schedule</p>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    onChange={onFileChange}
                    disabled={disabled}
                    accept="image/*,application/pdf"
                />
            </label>
        </div>
    );
}
