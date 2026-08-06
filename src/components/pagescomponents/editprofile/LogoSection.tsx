import type { Dispatch, SetStateAction } from "react";
import { Upload } from "lucide-react";

interface LogoSectionProps {
  logo: string | null;
  setLogo: Dispatch<SetStateAction<string | null>>;
}

export function LogoSection({ logo, setLogo }: LogoSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-400 flex flex-col items-center justify-center relative cursor-pointer hover:opacity-80 transition-opacity overflow-hidden group block">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        {logo ? (
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-300">Add</p>
            <p className="text-sm text-blue-300">Logo</p>
          </div>
        )}
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow group-hover:scale-110">
          <Upload className="w-4 h-4 text-gray-600" />
        </div>
      </label>
    </div>
  );
}
