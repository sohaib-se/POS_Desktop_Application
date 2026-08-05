import { Upload } from "lucide-react";

export function LogoSection() {
  return (
    <div>
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-400 flex flex-col items-center justify-center relative cursor-pointer hover:opacity-80 transition-opacity">
        <div className="text-center">
          <p className="text-2xl font-semibold text-blue-300">Add</p>
          <p className="text-sm text-blue-300">Logo</p>
        </div>
        <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <Upload className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
