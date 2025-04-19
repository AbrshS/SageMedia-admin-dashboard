import { Rocket } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="text-center space-y-6">
        {/* You can replace this with an actual image */}
        <div className="w-48 h-48 mx-auto mb-8 text-primary animate-bounce">
          <Rocket size={192} strokeWidth={1.2} />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">
          Analytics Dashboard Coming Soon!
        </h1>
        
        <p className="text-xl text-gray-600 max-w-lg mx-auto">
          We're working hard to bring you powerful analytics and insights. 
          Stay tuned for exciting updates!
        </p>
        
        <div className="text-sm text-gray-500">
          🚀 Expected launch: Q1 2024
        </div>
      </div>
    </div>
  );
}