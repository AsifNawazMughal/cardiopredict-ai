import { Heart } from "lucide-react";

export default function AuthHeader() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-center text-white">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
        <Heart className="w-7 h-7" fill="currentColor"/>
      </div>
      <h1 className="text-xl font-bold">CardioPredict AI</h1>
      <p className="text-red-100 text-sm mt-0.5">Heart Disease Risk Assessment System</p>
    </div>
  );
}
