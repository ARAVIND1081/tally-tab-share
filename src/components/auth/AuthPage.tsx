
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  console.log('AuthPage rendering, activeTab:', activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ExpenseSplit</h1>
          <p className="text-gray-600">Split expenses with friends and family</p>
        </div>
        
        <Card className="p-6 bg-white shadow-lg border border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
              <TabsTrigger 
                value="login" 
                className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0">
              <LoginForm onSwitchToSignup={() => setActiveTab('signup')} />
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <SignupForm onSwitchToLogin={() => setActiveTab('login')} />
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Secure authentication powered by Firebase</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
