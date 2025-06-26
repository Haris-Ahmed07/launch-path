import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Google API key is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File;
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;

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

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
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
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("React Component Architecture " + jobTitle + " tutorial")
    },
    {
      "title": "State Management Deep Dive",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("Redux Toolkit " + jobTitle + " state management")
    },
    {
      "title": "RESTful API Design",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("REST API design patterns " + jobTitle)
    },
    {
      "title": "Authentication & Security",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("JWT authentication " + jobTitle + " tutorial")
    },
    {
      "title": "Database Design",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("Database design patterns " + jobTitle)
    },
    {
      "title": "TypeScript Mastery",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("Advanced TypeScript " + jobTitle + " tutorial")
    },
    {
      "title": "GraphQL API Development",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("GraphQL API " + jobTitle + " tutorial")
    },
    {
      "title": "DevOps & CI/CD",
      "url": "https://www.youtube.com/results?search_query=" + encodeURIComponent("Docker Kubernetes CI/CD " + jobTitle)
    }
  ]
}

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