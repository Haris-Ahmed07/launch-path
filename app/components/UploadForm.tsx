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

// Define the file validation function with proper type
const validateFile = (files: FileList) => {
  if (files.length !== 1) return false;
  const file = files[0];
  return file.type === "application/pdf" && file.size <= 5 * 1024 * 1024;
};

const formSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(20, "Job description must be at least 20 characters"),
  resume: z
    .instanceof(FileList)
    .refine(
      (files) => files.length > 0,
      "Please upload a resume"
    )
    .refine(
      (files) => files.length === 1,
      "Please upload only one file"
    )
    .refine(
      (files) => files[0]?.type === "application/pdf",
      "Only PDF files are allowed"
    )
    .refine(
      (files) => files[0]?.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    ),
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload Your Details
        </CardTitle>
        <CardDescription>
          Upload your resume and job details to get personalized career assistance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              type="text"
              placeholder="e.g., Senior Software Engineer"
              {...register("jobTitle")}
              className={errors.jobTitle ? "border-red-500" : ""}
            />
            {errors.jobTitle && (
              <p className="text-sm text-red-500">{errors.jobTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the complete job description here..."
              rows={6}
              {...register("jobDescription")}
              className={errors.jobDescription ? "border-red-500" : ""}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume">Resume (PDF)</Label>
            <div className="flex flex-col space-y-2">
              <div 
                className="relative"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
                      // @ts-ignore - We need to assign to the ref
                      fileInputRef.current = e;
                      // Register the ref with react-hook-form
                      const { ref } = register('resume');
                      ref(e);
                    }
                  }}
                />
                <label
                  htmlFor="resume"
                  className={`flex flex-col items-center justify-center w-full h-32 px-4 transition-all bg-background border-2 border-dashed rounded-lg appearance-none cursor-pointer ${
                    isDragging 
                      ? 'border-primary/70 bg-primary/5 scale-[1.01] shadow-lg' 
                      : errors.resume 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isDragging ? (
                      <div className="animate-pulse">
                        <UploadCloud className="w-8 h-8 mb-2 text-primary" />
                      </div>
                    ) : (
                      <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                    )}
                    <p className="mb-2 text-sm text-muted-foreground text-center">
                      {isDragging ? (
                        <span className="font-semibold text-primary">Drop your resume here</span>
                      ) : (
                        <>
                          <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF (max. 5MB)
                    </p>
                  </div>

                </label>
              </div>
              <div className="flex items-center justify-between">
                {resume?.length > 0 ? (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-green-600">
                      {resume[0].name} ({(resume[0].size / 1024).toFixed(1)} KB)
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No file selected
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 5MB • PDF only
                </p>
              </div>
              {errors.resume && (
                <p className="flex items-center text-sm text-red-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.resume.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!isFormValid || loading}
            className={`w-full ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              "Generate Career Assistance"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}