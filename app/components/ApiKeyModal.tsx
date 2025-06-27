'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { X, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { saveApiKey, getApiKey, clearApiKey } from '../../lib/apiKeyManager';

// Simple alert component
const Alert = ({ 
  variant = 'default', 
  className = '', 
  children 
}: { 
  variant?: 'default' | 'destructive', 
  className?: string, 
  children: React.ReactNode 
}) => {
  const baseStyles = 'p-4 rounded-md mt-2 text-sm';
  const variantStyles = variant === 'destructive' 
    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  
  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <h3 className={`font-medium leading-none tracking-tight mb-1 ${className}`}>
    {children}
  </h3>
);

const AlertDescription = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
    {children}
  </div>
);

export default function ApiKeyModal({ 
  isOpen, 
  onClose,
  isInvalidKey = false 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isInvalidKey?: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);
  const [showTestResult, setShowTestResult] = useState(false);
  const router = useRouter();

  // Load saved API key if it exists
  useEffect(() => {
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const testApiKey = async (key: string) => {
    if (!key.trim()) return false;
    
    setIsTesting(true);
    setTestResult(null);
    setShowTestResult(false);
    
    try {
      // Simple test request to validate the API key
      const response = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
        params: { key },
        timeout: 10000 // 10 seconds timeout
      });
      
      if (response.status === 200 && Array.isArray(response.data.models)) {
        setTestResult({ success: true, message: 'API key is valid and working!' });
        return true;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error('API key test failed:', error);
      const errorMessage = error.response?.data?.error?.message || 
                         error.message || 
                         'Failed to validate API key. Please check your key and try again.';
      setTestResult({ 
        success: false, 
        message: errorMessage.includes('API key not valid') 
          ? 'The provided API key is invalid or has been deleted.' 
          : errorMessage 
      });
      return false;
    } finally {
      setIsTesting(false);
      setShowTestResult(true);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    const isValid = await testApiKey(apiKey);
    
    if (isValid) {
      setIsSaving(true);
      try {
        // Save the API key using our manager
        saveApiKey(apiKey);
        // Close the modal after a short delay
        setTimeout(() => {
          setIsSaving(false);
          onClose();
          // Refresh the page to ensure all components use the new key
          router.refresh();
        }, 500);
      } catch (error) {
        console.error('Error saving API key:', error);
        setIsSaving(false);
      }
    }
  };
  
  const handleTestKey = async () => {
    if (!apiKey.trim()) return;
    await testApiKey(apiKey);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        
        <CardHeader>
          <div className="flex items-center gap-2">
            {isInvalidKey ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <CardTitle>
              {isInvalidKey ? 'Invalid API Key' : 'API Key Required'}
            </CardTitle>
          </div>
          <CardDescription>
            {isInvalidKey 
              ? 'The current API key is invalid or has been deleted. Please enter a valid Google AI Studio API key.'
              : 'The free API quota has been exceeded. Please enter your own Google AI Studio API key to continue.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google AI Studio API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`pr-24 ${testResult?.success === false ? 'border-red-500' : ''} ${
                  testResult?.success === true ? 'border-green-500' : ''
                }`}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleTestKey}
                disabled={!apiKey.trim() || isTesting}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
              >
                {isTesting ? 'Testing...' : 'Test Key'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and only used to make requests to Google AI Studio.
            </p>
            
            {showTestResult && testResult && (
              <Alert variant={testResult.success ? 'default' : 'destructive'} className="mt-2">
                <div className="flex items-start">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mt-1 mr-2 flex-shrink-0" />
                  )}
                  <div>
                    <AlertTitle className="text-sm font-medium">
                      {testResult.success ? 'Success!' : 'Error'}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {testResult.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md text-sm">
            <p className="font-medium mb-2">How to get your API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google AI Studio API Keys</a></li>
              <li>Sign in with your Google account</li>
              <li>Click on "Create API Key"</li>
              <li>Copy the API key and paste it above</li>
            </ol>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <Button 
              variant="ghost" 
              onClick={() => {
                clearApiKey();
                setApiKey('');
                setTestResult(null);
                setShowTestResult(false);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
              size="sm"
            >
              Clear saved API key
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={isSaving || isTesting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!apiKey.trim() || isSaving || isTesting}
              >
                {isSaving ? 'Saving...' : 'Save API Key'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
