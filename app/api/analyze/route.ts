import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

// Function to test if an API key is valid
async function isApiKeyValid(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Try a simple request to validate the API key
    await model.generateContent("Test");
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get API key from headers or use environment variable
    let apiKey = req.headers.get('x-api-key');
    const envApiKey = process.env.GOOGLE_API_KEY;
    
    // If no API key in headers but we have an environment key, try that first
    if (!apiKey && envApiKey) {
      if (await isApiKeyValid(envApiKey)) {
        apiKey = envApiKey;
      }
    }
    
    // If still no valid API key, check for one in the request body (for client-side fallback)
    if (!apiKey) {
      const body = await req.json();
      if (body.apiKey) {
        if (await isApiKeyValid(body.apiKey)) {
          apiKey = body.apiKey;
        }
      }
    }
    
    // If we still don't have a valid API key, return an error
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: "API key is required",
          requiresApiKey: true
        },
        { status: 401 }
      );
    }

    // Get the content type
    const contentType = req.headers.get('content-type') || '';
    let resumeFile: File;
    let jobTitle: string;
    let jobDescription: string;

    try {
      if (contentType.includes('multipart/form-data')) {
        // Handle multipart form data
        const formData = await req.formData();
        const file = formData.get("resume") as unknown as File;
        
        if (!file) {
          throw new Error('No file uploaded');
        }
        
        // Convert to a proper File object
        const fileBuffer = await file.arrayBuffer();
        resumeFile = new File([fileBuffer], file.name || 'resume.pdf', { type: file.type || 'application/pdf' });
        jobTitle = formData.get("jobTitle") as string;
        jobDescription = formData.get("jobDescription") as string;
      } else if (contentType.includes('application/json')) {
        // Handle JSON data
        const body = await req.json();
        
        // If we have a base64 file in the JSON, convert it to a File object
        if (body.resume && body.resume.data && body.resume.name) {
          const base64Data = body.resume.data.split(',')[1] || body.resume.data;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          resumeFile = new File(
            [byteArray], 
            body.resume.name || 'resume.pdf', 
            { type: body.resume.type || 'application/pdf' }
          );
        } else {
          throw new Error('Invalid file data in request');
        }
        
        jobTitle = body.jobTitle;
        jobDescription = body.jobDescription;
      } else {
        return NextResponse.json(
          { error: 'Unsupported content type. Please use multipart/form-data or application/json' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error parsing request:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to parse request' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!resumeFile || !jobTitle || !jobDescription) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (resumeFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Parse PDF
    let pdfText: string;
    try {
      const buffer = await resumeFile.arrayBuffer();
      const pdfData = await pdfParse(Buffer.from(buffer));
      pdfText = pdfData.text;

      if (!pdfText || pdfText.trim().length < 10) {
        return NextResponse.json(
          { error: "Could not extract text from PDF. Please ensure the PDF contains readable text." },
          { status: 400 }
        );
      }
    } catch (pdfError) {
      console.error("PDF parsing error:", pdfError);
      return NextResponse.json(
        { error: "Failed to parse PDF file. Please ensure it's a valid PDF." },
        { status: 400 }
      );
    }

    // Initialize Gemini AI with the provided API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create detailed prompt
    const prompt = `
You are an expert career counselor and AI assistant. Based on the provided resume and job description, generate a professional cover letter.

**IMPORTANT: You must respond with ONLY a valid JSON object in the exact format specified below. Do not include any other text, explanations, or markdown formatting.**

Resume Content:
${pdfText.slice(0, 8000)}

Job Title: ${jobTitle}

Job Description:
${jobDescription.slice(0, 3000)}

Generate a JSON response with the following structure:
{
  "cover_letter": "A professional cover letter that focuses ONLY on skills and experiences that directly match the job requirements. Do not mention any skills that are not in the resume. Do not mention where the job was advertised. Do not include any placeholders or brackets. Format the closing with line breaks between each element.",
  "learning_roadmap": "# 🚀 6-Month Comprehensive Learning Roadmap\n\n## 📅 Month 1-2: Foundation Building\n\n### Frontend Architecture (Weeks 1-4)\n- **Component Architecture**\n  - Atomic Design Principles\n  - Compound Components Pattern\n  - Render Props Pattern\n  - Higher-Order Components (HOCs)\n  - Custom Hooks Best Practices\n\n- **State Management**\n  - React Context API Deep Dive\n  - Redux Toolkit Implementation\n  - State Normalization\n  - Optimistic UI Updates\n  - Server State Management (React Query/SWR)\n\n- **Performance Optimization**\n  - Code Splitting & Lazy Loading\n  - Memoization (useMemo, useCallback)\n  - Virtualization for Large Lists\n  - Bundle Analysis\n  - Web Vitals Optimization\n\n### Backend Integration (Weeks 5-8)\n- **RESTful API Design**\n  - Resource Naming Conventions\n  - HTTP Methods & Status Codes\n  - HATEOAS Implementation\n  - API Versioning Strategies\n  - Rate Limiting & Throttling\n\n- **Authentication & Authorization**\n  - JWT Implementation\n  - OAuth 2.0 & OpenID Connect\n  - Session Management\n  - Role-Based Access Control\n  - Multi-factor Authentication\n\n- **Database Design**\n  - SQL vs NoSQL Comparison\n  - Schema Design Patterns\n  - Indexing Strategies\n  - Query Optimization\n  - Transactions & ACID Properties\n\n## 📅 Month 3-4: Advanced Concepts\n\n### Advanced Frontend (Weeks 9-12)\n- **TypeScript Mastery**\n  - Advanced Types\n  - Generics\n  - Type Guards\n  - Declaration Merging\n  - Utility Types\n\n- **State Management Deep Dive**\n  - Redux Middleware\n  - Redux Toolkit Query\n  - State Machines (XState)\n  - Jotai/Recoil for Atomic State\n  - Zustand for Simpler State\n\n### Backend Development (Weeks 13-16)\n- **API Development**\n  - GraphQL Schema Design\n  - Apollo Server Implementation\n  - Data Loader Pattern\n  - Caching Strategies\n  - Subscriptions with WebSockets\n\n- **Serverless Architecture**\n  - AWS Lambda Functions\n  - Vercel/Netlify Functions\n  - Edge Functions\n  - Cold Start Optimization\n  - Cost Optimization\n\n## 📅 Month 5-6: Specialization & Projects\n\n### Focus Areas (Weeks 17-20)\n| Area | Technologies | Learning Resources | Key Concepts |\n|------|--------------|---------------------|--------------|\n| **Cloud** | AWS, Vercel | AWS Certified Cloud Practitioner, AWS Solutions Architect | IAM, VPC, S3, Lambda, API Gateway, CloudFront |\n| **DevOps** | Docker, GitHub Actions, Kubernetes | Docker Deep Dive, Kubernetes in Action | CI/CD Pipelines, Infrastructure as Code, Container Orchestration |\n| **Testing** | Cypress, Jest, React Testing Library | Testing JavaScript, Test-Driven Development | Unit Testing, Integration Testing, E2E Testing, Visual Regression Testing |\n\n### 🏗️ Capstone Project (Weeks 21-24)\n- **Project Scope**\n  - Full-stack application with microservices architecture\n  - Real-time collaboration features\n  - Comprehensive analytics dashboard\n  - Mobile-responsive design\n  - Comprehensive test suite\n\n- **Tech Stack**\n  - **Frontend**: Next.js 13+ with App Router\n  - **Backend**: Node.js with NestJS/Express\n  - **Database**: PostgreSQL with Prisma ORM\n  - **Infrastructure**: Docker, Kubernetes, AWS ECS/EKS\n  - **Monitoring**: Prometheus, Grafana, Sentry\n\n- **Key Features**\n  - 🔐 JWT Authentication with Refresh Tokens\n  - 📱 PWA Support for Offline Capabilities\n  - 🔄 Real-time Updates with WebSockets\n  - 📊 Advanced Analytics with Custom Dashboards\n  - 🧪 90%+ Test Coverage\n  - 🚀 CI/CD Pipeline with GitHub Actions\n  - 🔍 Full-text Search with Elasticsearch\n  - 📱 Responsive Design with Tailwind CSS\n\n## 📊 Success Metrics & KPIs\n\n### Technical Metrics\n- **Performance**: <100ms API response time, <2s page load time\n- **Reliability**: 99.9% uptime, <1% error rate\n- **Quality**: <0.5% bug rate, 90%+ test coverage\n- **Security**: Zero critical vulnerabilities, Regular security audits\n\n### Learning Outcomes\n- Mastery of modern web development tools and practices\n- Ability to architect scalable applications\n- Proficiency in performance optimization\n- Experience with DevOps and CI/CD\n- Strong understanding of security best practices\n\n### Portfolio Deliverables\n1. 3-5 production-grade projects\n2. Technical blog posts (2-3 per month)\n3. Open-source contributions (5+ PRs)\n4. Public speaking/tech talks (2-3 events)\n5. Comprehensive documentation for all projects\n\n## 📚 Weekly Learning Schedule\n\n### Monday-Thursday (2-3 hours/day)\n- 30 mins: Reading documentation/technical articles\n- 60 mins: Hands-on coding\n- 30 mins: Code review/refactoring\n- 30 mins: Testing and debugging\n\n### Friday (4 hours)\n- Project work and implementation\n- Writing technical documentation\n- Recording progress and challenges\n\n### Weekend (4-6 hours total)\n- Building portfolio projects\n- Contributing to open source\n- Writing technical blog posts\n- Networking and community engagement\n\n## 🔄 Continuous Improvement\n- Weekly code reviews\n- Monthly technical retrospectives\n- Quarterly skill assessments\n- Bi-annual portfolio updates\n- Annual certification goals",
  "study_notes": "Comprehensive study notes covering key technologies and skills from the job description.",
  "youtube_links": [
    {
      "title": "Frontend Architecture Tutorials",
      "url": "https://www.youtube.com/results?search_query=React%20Component%20Architecture%20Tutorial"
    },
    {
      "title": "State Management Deep Dive",
      "url": "https://www.youtube.com/results?search_query=Redux%20Toolkit%20State%20Management"
    },
    {
      "title": "RESTful API Design",
      "url": "https://www.youtube.com/results?search_query=REST%20API%20Design%20Patterns"
    },
    {
      "title": "Authentication & Security",
      "url": "https://www.youtube.com/results?search_query=JWT%20Authentication%20Tutorial"
    },
    {
      "title": "Database Design",
      "url": "https://www.youtube.com/results?search_query=Database%20Design%20Patterns"
    },
    {
      "title": "TypeScript Mastery",
      "url": "https://www.youtube.com/results?search_query=Advanced%20TypeScript%20Tutorial"
    },
    {
      "title": "GraphQL API Development",
      "url": "https://www.youtube.com/results?search_query=GraphQL%20API%20Tutorial"
    },
    {
      "title": "DevOps & CI/CD",
      "url": "https://www.youtube.com/results?search_query=Docker%20Kubernetes%20CI%20CD"
    }
  ],
  "resume_analysis": {
    "missing_skills": ["List of skills from the job description that are missing from the resume"],
    "areas_for_improvement": ["Specific areas where the resume could be improved"],
    "score": 75,
    "feedback": "Detailed feedback on how well the resume matches the job description and specific recommendations for improvement."
  },
  "interview_questions": {
    "technical_questions": [
      "What are the key differences between REST and GraphQL, and when would you choose one over the other?",
      "Explain the Virtual DOM in React and how it improves performance.",
      "How would you optimize a slow-loading web application?"
    ],
    "behavioral_questions": [
      "Tell me about a time you had to learn a new technology quickly.",
      "Describe a challenging bug you faced and how you solved it.",
      "How do you handle disagreements with team members about technical decisions?"
    ],
    "system_design_questions": [
      "How would you design a URL shortening service like bit.ly?",
      "Design a real-time chat application like WhatsApp.",
      "How would you scale a web application to handle millions of users?"
    ],
    "job_specific_questions": [
      "How would you implement a feature that allows users to drag and drop components in a dashboard?",
      "What are the key considerations when building a full-stack application?",
      "How would you handle working with legacy code?"
    ]
  }
}

Resume Analysis Requirements:
1. Analyze the resume against the job description and identify missing skills that are required for the position
2. Identify areas where the resume could be improved (e.g., formatting, missing information, weak action verbs)
3. Provide a score out of 100 based on how well the resume matches the job description
4. Give specific, actionable feedback for improvement

Cover Letter Requirements:
1. Do not mention where the job was advertised
2. Only include skills that are both in the resume and relevant to the job
3. If a required skill is missing from the resume, do not mention it at all
4. For projects, include the project URL in parentheses immediately after the project name, like this: "Project Name (https://project-url.com)"
5. Do not include project links at the end of the cover letter
6. Only include portfolio, GitHub, and LinkedIn in the contact information section

Closing format (exactly as shown):
   Thank you for your time and consideration.\n\n   Sincerely,\n   Haris Ahmed\n   haris.14787@gmail.com\n   +92 340 3568231\n   [Include LinkedIn URL if available]\n   [Include GitHub URL if available]\n   [Include Portfolio URL if available]

Example structure:
[Professional greeting]
[Direct expression of interest in position]
[Relevant experience and projects - only those matching job requirements]
[Skills that match the job description - only those in resume]
[Closing with proper line breaks]`;

    // Generate content with Gemini
    let result;
    try {
      result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", responseText);
        return NextResponse.json(
          { error: "Invalid response format from AI service" },
          { status: 500 }
        );
      }

      const jsonResponse = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (!jsonResponse.cover_letter || !jsonResponse.learning_roadmap || 
          !jsonResponse.study_notes || !Array.isArray(jsonResponse.youtube_links)) {
        return NextResponse.json(
          { error: "Incomplete response from AI service" },
          { status: 500 }
        );
      }

      return NextResponse.json(jsonResponse);

    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      
      // Handle quota exceeded errors
      if (aiError.status === 429 || 
          aiError.message?.includes('429') || 
          aiError.message?.includes('quota') || 
          aiError.message?.includes('Quota')) {
        return NextResponse.json(
          { 
            error: "Daily free tier quota exceeded. Please try again tomorrow or upgrade your plan.",
            type: "QUOTA_EXCEEDED",
            details: "You've reached the free tier limit for the Gemini API.",
            documentation: "https://ai.google.dev/gemini-api/docs/rate-limits"
          },
          { 
            status: 429,
            headers: {
              'Retry-After': '86400', // 24 hours in seconds
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Handle invalid API key
      if (aiError.message?.includes("API_KEY") || aiError.message?.includes("API key")) {
        return NextResponse.json(
          { 
            error: "Invalid API key configuration",
            type: "INVALID_API_KEY"
          },
          { status: 500 }
        );
      }
      
      // Handle other AI service errors
      return NextResponse.json(
        { 
          error: aiError.message || "Failed to generate content. Please try again.",
          type: "AI_SERVICE_ERROR"
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal server error",
        type: "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}