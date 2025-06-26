'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, UploadCloud } from "lucide-react";

// Define file validation schema
const fileSchema = z.custom<FileList>()
  .refine(
    (files) => files && files.length === 1,
    "Please upload exactly one file"
  )
  .refine(
    (files) => files[0]?.type === "application/pdf",
    "Only PDF files are allowed"
  )
  .refine(
    (files) => files[0]?.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB"
  );

const formSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(20, "Job description must be at least 20 characters"),
  resume: fileSchema,
});

type FormData = z.infer<typeof formSchema>;

interface UploadFormProps {
  onSuccess: (data: any) => void;
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty, isValid, isSubmitting },
    watch,
    reset,
    trigger
  } = useForm<FormData>({ 
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Validate on change
    reValidateMode: 'onChange'
  });

  // Watch form fields to enable/disable submit button
  const jobTitle = watch('jobTitle');
  const jobDescription = watch('jobDescription');
  const resume = watch('resume');
  
  // Check if all required fields are filled
  const isFormValid = Boolean(
    jobTitle && 
    jobDescription && 
    resume?.length > 0 && 
    !errors.resume &&
    !isUploading
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the drop zone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is a PDF
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      
      // Create a new file list with the dropped file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Update the file input
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        
        // Create and dispatch a change event
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
        
        // Manually trigger form validation
        trigger('resume');
      }
    }
  };

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const onSubmit = async (formData: FormData) => {
    try {
      // Prevent default form submission
      const event = window.event as Event | undefined;
      if (event) {
        event.preventDefault();
      }
      
      setLoading(true);
      setIsUploading(true);
      setError(null);
      
      // Validate file again before upload
      if (!formData.resume || formData.resume.length === 0) {
        throw new Error('No resume file selected');
      }
      
      const data = new FormData();
      data.append("resume", formData.resume[0]);
      data.append("jobTitle", formData.jobTitle);
      data.append("jobDescription", formData.jobDescription);

      const response = await axios.post("/api/analyze", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
      });

      onSuccess(response.data);
      reset();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        "An error occurred while processing your request"
      );
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto text-sm border-2 border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-lg hover:shadow-xl">
      <CardHeader className="pb-1 px-4 pt-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Upload className="h-4 w-4" />
          Upload Your Details
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Upload your resume and job details
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-3">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="jobTitle" className="text-xs font-medium">Job Title</Label>
            <Input
              id="jobTitle"
              type="text"
              placeholder="e.g., Senior Software Engineer"
              {...register("jobTitle")}
              className={`w-full ${errors.jobTitle ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-sm border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all`}
            />
            {errors.jobTitle && (
              <p className="text-xs text-red-500 mt-0.5">{errors.jobTitle.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="jobDescription" className="text-xs font-medium">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste job description..."
              rows={3}
              {...register("jobDescription")}
              className={`${errors.jobDescription ? "border-red-500" : "border-gray-300 dark:border-gray-600"} min-h-[80px] text-sm border rounded-md p-3 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all`}
            />
            {errors.jobDescription && (
              <p className="text-xs text-red-500 mt-0.5">{errors.jobDescription.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Resume (PDF, max 5MB)</Label>
            <div 
              className={`border border-dashed rounded-md p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isDragging ? 'border-primary/70 bg-primary/5' : 'border-gray-300 dark:border-gray-600'}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}
            >
              <input
                id="resume"
                type="file"
                accept="application/pdf"
                className="hidden"
                {...register("resume", {
                  onChange: () => trigger("resume")
                })}
                ref={(e) => {
                  if (e) {
                    fileInputRef.current = e;
                    const { ref } = register('resume');
                    ref(e);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center py-1">
                {isDragging ? (
                  <UploadCloud className="w-5 h-5 mb-1 text-primary" />
                ) : (
                  <Upload className="w-4 h-4 mb-1 text-muted-foreground" />
                )}
                <p className="text-xs text-center text-muted-foreground leading-tight">
                  {isDragging ? (
                    <span className="font-medium text-primary">Drop your resume here</span>
                  ) : (
                    <>
                      <span className="font-medium text-primary">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  PDF (max. 5MB)
                </p>
              </div>
            </div>
            {resume?.length > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {resume[0].name} ({(resume[0].size / 1024).toFixed(1)} KB)
                </div>
              </div>
            )}
            {errors.resume && (
              <p className="text-sm text-red-500 mt-1">
                {errors.resume.message}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-1 text-sm h-9 font-medium"
            disabled={!isFormValid || loading}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              'Generate Career Assistance'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}