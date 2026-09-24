import os
import glob

search_path = r"c:\Users\Code\Desktop\Fresh Laimsoft POS\POS_Desktop_Application\src\components\pagescomponents\settings\tabs\printTab\Print documents\*.tsx"

files = glob.glob(search_path)
files.append(r"c:\Users\Code\Desktop\Fresh Laimsoft POS\POS_Desktop_Application\src\components\pagescomponents\settings\tabs\PrintTab.tsx")

listener_code = """
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setInfo(prev => ({ ...prev, ...detail }));
    };
    window.addEventListener("print-profile-draft", handler);
    return () => window.removeEventListener("print-profile-draft", handler);
  }, []);
"""

for file_path in files:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "window.addEventListener(\"print-profile-draft\", handler);" in content:
        print(f"Skipping {os.path.basename(file_path)} (already has listener)")
        continue
        
    if "return info;" in content:
        # Find the last occurrence of return info; in the useCompanyInfo function block
        # For simplicity, we just replace `  return info;` with the listener code + `  return info;`
        # But we must be sure it's inside `useCompanyInfo`.
        # Since we only have one `return info;` per file, we can do a simple replace.
        content = content.replace("  return info;", listener_code + "\n  return info;")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {os.path.basename(file_path)}")
    else:
        print(f"Could not patch {os.path.basename(file_path)}")
