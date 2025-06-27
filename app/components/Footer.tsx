import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Github, Linkedin, Mail, Phone, Code, Briefcase } from 'lucide-react';



export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Haris Ahmed
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Full Stack Developer | AI Enthusiast | Problem Solver
            </p>
            <div className="mt-4 flex space-x-4">
            <a 
                href="https://www.haris-ahmed.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="Portfolio"
              >
                <Briefcase className="h-5 w-5" />
              </a>
              <a 
                href="https://github.com/Haris-Ahmed07" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com/in/Haris-Ahmed007" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:haris.14787@gmail.com" 
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Contact</h3>
            <div className="mt-4 space-y-2">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <a href="mailto:haris.14787@gmail.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  haris.14787@gmail.com
                </a>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                <a href="tel:+92 340 3568231" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  +92 340 3568231
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Let's Connect</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              Have a project in mind or want to discuss opportunities? I'd love to hear from you!
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=haris.14787@gmail.com" target="_blank" rel="noopener noreferrer" className='inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors'>
                <Mail className="h-5 w-5 mr-2" />
                Send a message
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
            &copy; {currentYear} Haris Ahmed. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
