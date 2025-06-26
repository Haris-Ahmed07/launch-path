'use client';

import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultsDisplay from "./components/ResultsDisplay";
import { Brain, Target, BookOpen, Youtube } from "lucide-react";
import { Header } from "./components/header";
import { useTheme } from "next-themes";

type ResultData = {
  cover_letter: string;
  learning_roadmap: string;
  study_notes: string;
  youtube_links: Array<{
    title: string;
    url: string;
  }>;
  jobTitle?: string;
} | null;

export default function HomePage() {
  const [result, setResult] = useState<ResultData>(null);

  const handleBack = () => {
    setResult(null);
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced AI analyzes your resume and job requirements to provide personalized recommendations"
    },
    {
      icon: Target,
      title: "Tailored Cover Letters",
      description: "Generate professional cover letters that highlight your relevant experience"
    },
    {
      icon: BookOpen,
      title: "Learning Roadmaps",
      description: "Get structured learning paths with milestones and timelines for skill development"
    },
    {
      icon: BookOpen,
      title: "Interview Preparation",
      description: "Get tailored interview questions and answers based on your resume and job description"
    }
  ];

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {!result ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left side - Content */}
            <div className="lg:w-1/2">
              <div className="mb-8">
                <h1 className={`text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 ${isDark ? 'dark:from-blue-400 dark:to-purple-400' : ''}`}>
                  Launch Path
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  AI-Powered Career Assistant for Job Seekers
                </p>
                <p className="text-base text-gray-600 max-w-2xl mb-8">
                  Upload your resume and job description to get personalized cover letters, learning roadmaps, and actionable steps to land your next dream job.
                </p>
                
                {/* How it Works */}
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-6">How It Works</h2>
                  <div className="space-y-5">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <feature.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base">{feature.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Upload Form */}
            <div className="lg:w-1/2 w-full sticky top-4 pt-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4 text-start">Get Started</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border-2 border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all hover:shadow-xl">
                <UploadForm onSuccess={setResult} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ResultsDisplay data={result} onBack={handleBack} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
          <p className="text-base">
            Made with ❤️ by Haris Ahmed
          </p>
        </footer>
      </div>
    </div>
  );
}