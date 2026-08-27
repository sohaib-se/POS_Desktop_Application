import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Upload, Trash2 } from "lucide-react";
import { ConfirmDeleteModal } from "../../common/ConfirmDeleteModal";

interface LogoSectionProps {
  logo: string | null;
  setLogo: Dispatch<SetStateAction<string | null>>;
}

export function LogoSection({ logo, setLogo }: LogoSectionProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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

  const handleDelete = () => {
    setLogo(null);
    setIsConfirmOpen(false);
  };

  return (
    <div className="relative group/logo inline-block w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 flex-shrink-0">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="logo-upload"
        onChange={handleFileChange}
      />
      {logo ? (
        <>
          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          {/* Overlay with Upload and Delete icons */}
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover/logo:opacity-100 transition-opacity">
            <label
              htmlFor="logo-upload"
              className="cursor-pointer text-white hover:text-blue-300 transition-colors"
              title="Change logo"
            >
              <Upload className="w-6 h-6" />
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsConfirmOpen(true);
              }}
              title="Delete logo"
              className="text-white hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </>
      ) : (
        <label
          htmlFor="logo-upload"
          className="block w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex flex-col items-center justify-center relative cursor-pointer hover:opacity-90 transition-opacity group/empty"
        >
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-300">Add</p>
            <p className="text-sm text-blue-300">Logo</p>
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow group-hover/empty:scale-110">
            <Upload className="w-4 h-4 text-gray-600" />
          </div>
        </label>
      )}

      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Logo"
        message="Are you sure you want to remove the business logo? Remember to save changes."
        isDeleting={false}
      />
    </div>
  );
}
