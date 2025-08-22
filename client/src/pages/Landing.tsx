import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, MessageSquare, Zap, Shield, Globe, Code } from 'lucide-react';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Learning VI
            </h1>
          </div>
          <Button onClick={handleLogin} size="lg" data-testid="button-login">
            Get Started
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Advanced AI Chat Interface
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Experience the future of AI-powered conversations with Learning VI. 
            Intelligent model routing, seamless conversation management, and powerful integrations.
          </p>
          <Button onClick={handleLogin} size="lg" className="px-8 py-4 text-lg" data-testid="button-hero-login">
            Start Chatting Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Conversations</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced AI models that understand context and provide meaningful responses tailored to your needs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Model Routing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically routes to specialized models based on your query type - code, research, creative, or analysis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your conversations are encrypted and stored securely with enterprise-grade security measures.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Research Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built-in web research capabilities to provide up-to-date information and sources.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Code Assistance</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced code generation, debugging, and architecture guidance for developers.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Learning Engine</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Continuously learns from your interactions to provide more personalized and accurate responses.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Experience the Future?
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who are already leveraging the power of Learning VI.
          </p>
          <Button onClick={handleLogin} size="lg" className="px-12 py-4 text-lg" data-testid="button-cta-login">
            Get Started Free
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 Learning VI. Advanced AI Chat Interface.</p>
        </div>
      </footer>
    </div>
  );
}
