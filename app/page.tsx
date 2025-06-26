'use client';

import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultsDisplay from "./components/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, BookOpen, Youtube } from "lucide-react";
import { Header } from "./components/header";
import { useTheme } from "next-themes";

// Add this type definition if not already present
type ResultData = {
  cover_letter: string;
  learning_roadmap: string;
  study_notes: string;
  youtube_links: string[];
};

export default function HomePage() {
  const [result, setResult] = useState(null);

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
      icon: Youtube,
      title: "Curated Resources",
      description: "Access handpicked YouTube videos and learning materials for your career growth"
    }
  ];

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 ${isDark ? 'dark:from-blue-400 dark:to-purple-400' : ''}`}>
            Launch Path
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Career Assistant for Job Seekers
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Upload your resume and job description to get personalized cover letters, 
            learning roadmaps, study notes, and curated learning resources.
          </p>
        </div>

        {!result ? (
          <>
            {/* Features Section */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-blue-50 rounded-full w-fit">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Upload Form */}
            <UploadForm onSuccess={setResult} />

            {/* How it Works */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Upload Your Resume</h3>
                  <p className="text-gray-600">Upload your resume in PDF format along with the job details</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-gray-600">Our AI analyzes your background against job requirements</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Get Results</h3>
                  <p className="text-gray-600">Receive personalized career assistance and learning resources</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ResultsDisplay data={result} onBack={handleBack} />
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-gray-500">
          <p>
            Made with ❤️ by Haris Ahmed using Next.js, ShadCN UI
          </p>
        </footer>
      </div>
    </div>
  );
}