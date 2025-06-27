'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Youtube, 
  Download,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Code2,
  LayoutGrid,
  MessageSquare,
  Users
} from "lucide-react";
import { ReactNode, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type MarkdownComponent = React.ComponentType<{
  children?: ReactNode;
  [key: string]: any;
}>;

interface YouTubeLink {
  title: string;
  url: string;
}

interface InterviewQuestions {
  technical_questions: string[];
  behavioral_questions: string[];
  system_design_questions: string[];
  job_specific_questions: string[];
}

interface ResumeAnalysis {
  missing_skills: string[];
  areas_for_improvement: string[];
  score: number;
  feedback: string;
}

interface ResultData {
  cover_letter: string;
  learning_roadmap: string;
  study_notes: string;
  youtube_links: YouTubeLink[];
  jobTitle?: string;
  resume_analysis?: ResumeAnalysis;
  interview_questions?: InterviewQuestions;
}

interface ResultsDisplayProps {
  data: ResultData;
  onBack?: () => void;
}

export default function ResultsDisplay({ data, onBack }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = (content: string, filename: string, asPdf = false) => {
    if (asPdf) {
      // For PDF download, we'll handle it in the handleDownloadPdf function
      return;
    }
    
    // For regular text download
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadPdf = async (content: string, title: string) => {
    try {
      // Dynamically import required libraries
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      // Find the parent card that contains the content we want to capture
      let cardElement: HTMLElement | null = null;
      
      // Find the card based on the title
      const cards = document.querySelectorAll('[data-card-type]');
      cards.forEach(card => {
        const cardTitle = card.querySelector('h2')?.textContent?.toLowerCase();
        if (cardTitle && title.toLowerCase().includes(cardTitle.replace(/\s+/g, ''))) {
          cardElement = card as HTMLElement;
        }
      });
      
      if (!cardElement) {
        // Fallback to finding by content type if direct match fails
        const contentTypes = ['cover', 'roadmap', 'notes'];
        const type = contentTypes.find(t => title.toLowerCase().includes(t));
        if (type) {
          cardElement = document.querySelector(`[data-card-type="${type}"]`) as HTMLElement;
        }
      }
      
      if (!cardElement) {
        throw new Error('Could not find the content to export');
      }
      
      // Create a clone of the card to avoid affecting the original
      const cardClone = cardElement.cloneNode(true) as HTMLElement;
      
      // Remove buttons and other interactive elements from the clone
      const elementsToRemove = cardClone.querySelectorAll('button, .hidden, [data-pdf-ignore]');
      elementsToRemove.forEach(el => el.remove());
      
      // Set styles for the clone - minimal padding for PDF
      cardClone.style.width = '210mm';
      cardClone.style.padding = '3mm 5mm';
      cardClone.style.backgroundColor = 'white';
      cardClone.style.boxSizing = 'border-box';
      cardClone.style.margin = '0';
      
      // Add a class for PDF-specific styles
      cardClone.classList.add('pdf-export');
      
      // Apply PDF-specific styles - ensure light mode and proper colors
      const style = document.createElement('style');
      style.textContent = `
        /* Force light mode and ensure text is visible */
        .pdf-export, .pdf-export * {
          color: #000000 !important;
          background-color: #ffffff !important;
        }
        .pdf-export {
          font-size: 11px !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          background-color: #ffffff !important;
          padding: 0 5mm 2mm 5mm !important; /* Consistent padding */
          page-break-inside: avoid !important; /* Keep content together */
          orphans: 3; /* Minimum lines at bottom of page */
          widows: 3;  /* Minimum lines at top of page */
        }
        .pdf-export h1 { 
          font-size: 1.8em !important;
          color: #000000 !important;
        }
        .pdf-export h2 { 
          font-size: 1.5em !important;
          color: #000000 !important;
        }
        .pdf-export h3 { 
          font-size: 1.3em !important;
          color: #000000 !important;
        }
        .pdf-export h4 { 
          font-size: 1.1em !important;
          color: #000000 !important;
        }
        .pdf-export p, 
        .pdf-export li { 
          margin: 0.3em 0 !important;
          line-height: 1.5 !important;
          color: #000000 !important;
          padding-bottom: 0.5mm !important;
          page-break-inside: avoid !important; /* Keep paragraphs together */
          page-break-after: avoid !important; /* Avoid page break after */
        }
        
        /* Keep headings with their content */
        .pdf-export h1, 
        .pdf-export h2, 
        .pdf-export h3, 
        .pdf-export h4 {
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }
        
        /* Keep lists together */
        .pdf-export ul, 
        .pdf-export ol {
          page-break-inside: avoid !important;
          margin-top: 0.5em !important;
          margin-bottom: 0.5em !important;
        }
        .pdf-export table { 
          width: 100% !important;
          font-size: 10px !important;
          color: #000000 !important;
        }
        .pdf-export pre,
        .pdf-export code {
          margin: 0.5em 0 !important;
          padding: 0.8em 0.5em !important;
          background-color: #f5f5f5 !important;
          color: #000000 !important;
          border: 1px solid #e0e0e0 !important;
          line-height: 1.5 !important;
          overflow: visible !important;
          page-break-inside: avoid !important; /* Keep code blocks together */
          page-break-after: avoid !important;
        }
        
        /* Add page break control for sections */
        .pdf-export > * {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
        
        /* Ensure tables stay together */
        .pdf-export table {
          page-break-inside: auto !important;
        }
        .pdf-export table tr {
          page-break-inside: avoid !important;
          page-break-after: auto !important;
        }
      `;
      cardClone.prepend(style);
      
      // Create a container for the PDF content - minimal padding
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.padding = '5mm 8mm';
      container.style.backgroundColor = 'white';
      container.style.zIndex = '9999';
      
      // Add the cloned card to the container
      container.appendChild(cardClone);
      document.body.appendChild(container);
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set container to full width of content
      container.style.width = '100%';
      container.style.overflow = 'visible';
      
      // Clean up the container
      const pdfButtons = container.querySelectorAll('button, .hidden, [data-pdf-ignore]');
      pdfButtons.forEach((el: Element) => el.remove());
      
      // Simple html2canvas configuration with minimal options
      const canvas = await html2canvas(container as HTMLElement, {
        useCORS: true,
        logging: false,
        allowTaint: true
      });
      
      // Calculate dimensions
      const width = canvas.width;
      const height = canvas.height;
      const ratio = width / height;
      
      // Set PDF page size (A4 dimensions in mm)
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      
      // Calculate dimensions to fit content on a single page
      let contentWidth = pageWidth;
      let contentHeight = pageHeight;
      
      if (width / height > pageWidth / pageHeight) {
        // Content is wider than it is tall (landscape)
        contentHeight = pageWidth / ratio;
      } else {
        // Content is taller than it is wide (portrait)
        contentWidth = pageHeight * ratio;
      }
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: contentWidth > pageWidth ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pageWidth, pageHeight]
      });
      
      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        contentWidth,
        contentHeight
      );
      
      // Clean up
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      
      // Save the PDF
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download if PDF generation fails
      handleDownload(content, `${title.toLowerCase().replace(/\s+/g, '-')}.txt`);
    }
  };

  const formatText = (content: unknown, isCoverLetter = false) => {
    // Handle undefined, null, or non-string values
    if (content === null || content === undefined) {
      return <p className="text-gray-500 italic">No content available</p>;
    }
    
    // If the content is not a string, try to convert it
    const text = String(content);

    // For cover letter, preserve newlines by replacing them with <br />
    if (isCoverLetter) {
      return (
        <div className="whitespace-pre-line">
          {text}
        </div>
      );
    }
    
    const CodeBlock: MarkdownComponent = ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }

      const match = /language-(\w+)/.exec(className || '');
      const language = match?.[1] || 'javascript';
      const code = String(children).replace(/\n$/, '');

      return (
        <div className="rounded-md overflow-hidden my-4">
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    };
    
    return (
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            a: ({ node, ...props }) => (
              <a 
                className="text-blue-600 hover:underline dark:text-blue-400" 
                target="_blank" 
                rel="noopener noreferrer"
                {...props}
              />
            ),
            code: CodeBlock as any,
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
            th: ({ node, ...props }) => (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-6 py-4 whitespace-nowrap text-sm border-b border-gray-200 dark:border-gray-700" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-300" {...props} />
            ),
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Your Career Assistance Results</h2>
        {onBack && (
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
        )}
      </div>

      {/* Cover Letter Section */}
      <Card data-card-type="cover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle>Cover Letter</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCopy(data.cover_letter)}
              className="gap-1"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDownload(data.cover_letter, 'cover-letter.txt')}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {formatText(data.cover_letter, true)}
          </div>
        </CardContent>
      </Card>

      {/* Learning Roadmap */}
      <Card data-card-type="roadmap">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Learning Roadmap
            </CardTitle>
            <CardDescription>
              Step-by-step learning path to enhance your skills
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadPdf(data.learning_roadmap, 'Learning Roadmap')}
            className="gap-1 self-start"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {formatText(data.learning_roadmap)}
          </div>
          
        </CardContent>
      </Card>

      

      {/* Resume Analysis */}
      {data.resume_analysis && (
        <Card data-card-type="resume-analysis" className="border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Analysis
              </CardTitle>
              <CardDescription>
                How well your resume matches the job description
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {data.resume_analysis.score}%
                </div>
                <div className="text-sm text-muted-foreground">Match Score</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Missing Skills</h3>
              {data.resume_analysis.missing_skills.length > 0 ? (
                <ul className="list-disc pl-6 space-y-1">
                  {data.resume_analysis.missing_skills.map((skill, i) => (
                    <li key={i} className="text-foreground">{skill}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No major skills missing. Good job!</p>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-6 space-y-1">
                {data.resume_analysis.areas_for_improvement.map((item, i) => (
                  <li key={i} className="text-foreground">{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Feedback</h3>
              <p className="whitespace-pre-line">{data.resume_analysis.feedback}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Notes */}
      {/* <Card data-card-type="notes">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Study Notes
          </CardTitle>
          <CardDescription>
            Key takeaways and notes to help you study effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {formatText(data.study_notes)}
          </div>
        </CardContent>
      </Card> */}

      {/* Interview Questions */}
      {data.interview_questions && (
        <Card data-card-type="interview-questions" className="border-l-4 border-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Interview Preparation
            </CardTitle>
            <CardDescription>
              Practice these questions to prepare for your {data.jobTitle || 'next'} interview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Technical Questions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-purple-500" />
                Technical Questions
              </h3>
              <ul className="space-y-3 pl-2">
                {data.interview_questions.technical_questions.map((question, i) => (
                  <li key={`tech-${i}`} className="relative pl-4">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    <p className="text-muted-foreground">{question}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Behavioral Questions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Behavioral Questions
              </h3>
              <ul className="space-y-3 pl-2">
                {data.interview_questions.behavioral_questions.map((question, i) => (
                  <li key={`beh-${i}`} className="relative pl-4">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    <p className="text-muted-foreground">{question}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Design Questions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-green-500" />
                System Design Questions
              </h3>
              <ul className="space-y-3 pl-2">
                {data.interview_questions.system_design_questions.map((question, i) => (
                  <li key={`sys-${i}`} className="relative pl-4">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                    <p className="text-muted-foreground">{question}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Job-Specific Questions */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-500" />
                Job-Specific Questions
              </h3>
              <ul className="space-y-3 pl-2">
                {data.interview_questions.job_specific_questions.map((question, i) => (
                  <li key={`job-${i}`} className="relative pl-4">
                    <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    <p className="text-muted-foreground">{question}</p>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* YouTube Resources */}
      {/* <Card data-card-type="youtube">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Video Learning Resources
          </CardTitle>
          <CardDescription>
            Curated YouTube videos to enhance your understanding of {data.jobTitle || 'the role'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {data.youtube_links.map((item, index) => {
              // For backward compatibility, handle both string and object formats
              const videoUrl = typeof item === 'string' ? item : item.url;
              const videoTitle = typeof item === 'string' ? `Video Resource ${index + 1}` : item.title;
              
              // Extract video ID from YouTube URL
              const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] || '';
              const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              
              return (
                <div key={index} className="group rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                  <a 
                    href={videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={thumbnailUrl} 
                        alt={videoTitle} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/480x360?text=No+Thumbnail';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-colors">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                        {videoTitle}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                        <Youtube className="h-4 w-4 mr-1 text-red-600" />
                        YouTube
                      </p>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
          {data.youtube_links.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No video resources available for this topic.
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}