import { useState } from "react";

export function useTemplateUpload() {
  const [templateFile, setTemplateFile] = useState(null);

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) setTemplateFile(file);
  };

  return { templateFile, handleTemplateUpload };
}
