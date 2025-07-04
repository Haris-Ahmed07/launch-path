# 🚀 Launch Path - AI-Powered Career Assistant

A comprehensive career assistant that helps job seekers create tailored application materials and develop personalized career roadmaps. Upload your resume and job description to generate professional cover letters, receive skill gap analysis, and get a structured learning path to land your dream job.

## ✨ Key Features

### 📝 AI-Powered Career Tools
- **Smart Cover Letter Generator**: Create customized cover letters that highlight your relevant experience for each job application
- **Resume Analysis**: Get detailed feedback on your resume with actionable improvement suggestions
- **Skill Gap Identification**: Discover which skills you're missing for your target roles

### 🎯 Personalized Career Development
- **Learning Roadmaps**: Receive structured learning paths with milestones and timelines
- **Skill Development**: Get recommendations for courses and resources to bridge skill gaps
- **Career Progression**: Visualize your path from current skills to target job requirements

### 🤖 AI-Enhanced Job Search
- **Job Description Analysis**: Understand key requirements and responsibilities
- **ATS Optimization**: Ensure your resume passes through Applicant Tracking Systems
- **Interview Preparation**: Get tailored interview questions based on your resume and job description

### 🎨 User Experience
- **Modern, Responsive Design**: Works seamlessly on all devices
- **Dark/Light Mode**: Choose your preferred theme for comfortable viewing
- **Document Processing**: Supports PDF and DOCX file formats
- **Real-time Feedback**: Get instant analysis and suggestions

## 🛠️ Tech Stack

- **AI & Machine Learning**: 
  - [Google's Gemini AI](https://aistudio.google.com/apikey) - For generating cover letters and analyzing resumes
  - Natural Language Processing - For understanding job descriptions and resume content

- **Frontend**:
  - [Next.js 14](https://nextjs.org/) - React framework for server-rendered applications
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com/) - Accessible, unstyled UI components
  - [Lucide React](https://lucide.dev/) - Beautiful, consistent icons
  - [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) - Form handling and validation

- **Document Processing**:
  - [pdf-parse](https://github.com/mozilla/pdf.js/) - Extract text from PDF resumes
  - [mammoth.js](https://github.com/mike-mizn/mammoth.js) - Parse DOCX files
  - [jsPDF](https://github.com/parallax/jsPDF) - Generate downloadable PDFs

- **Development Tools**:
  - TypeScript - For type-safe development
  - ESLint & Prettier - Code quality and formatting
  - Git - Version control

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- Google Generative AI API key (for AI features)
- A resume in PDF or DOCX format (for testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Haris-Ahmed07/launch-path.git
   cd launch-path
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🏗️ Project Structure

```
launch-path/
├── app/                  # App router pages and layouts
│   ├── api/              # API routes for resume parsing and AI processing
│   │   ├── analyze/      # Resume and job description analysis endpoints
│   │   ├── generate/     # Cover letter and roadmap generation
│   │   └── skills/       # Skill analysis and recommendations
│   ├── components/       # Page-specific components
│   └── lib/              # Utility functions and AI integration
├── components/           # Reusable UI components
│   ├── resume/           # Resume upload and display components
│   ├── editor/           # Cover letter editor components
│   ├── roadmap/          # Learning path visualization
│   └── ui/               # Base UI components
├── public/               # Static assets
├── lib/                  # Shared utilities and services
│   ├── ai/               # AI service integrations
│   ├── parsers/          # Document parsing logic
│   └── utils/            # Helper functions
├── styles/               # Global styles and themes
├── types/                # TypeScript type definitions
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## 🤝 Contributing

We welcome contributions to make Launch Path even better for job seekers! Here's how you can help:

### Ways to Contribute
- Improve AI prompt engineering for better cover letters
- Add support for more document formats
- Enhance the resume analysis algorithm
- Create more detailed learning roadmaps
- Add unit and integration tests
- Improve the UI/UX
- Translate the application to other languages

### Getting Started
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request with a clear description of your changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

I'd like to acknowledge the following resources and communities that made this project possible:

- [Google's Gemini AI](https://ai.google.dev/) - For powering our AI features
- [Next.js Documentation](https://nextjs.org/docs) - For the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/docs) - For making styling a breeze
- [Radix UI](https://www.radix-ui.com/docs) - For accessible UI components
- The open-source community - For the countless packages that make development faster and better

## 📞 Support

If you need help or want to report an issue, please open an issue in the GitHub repository. For feature requests or feedback, we'd love to hear from you!
