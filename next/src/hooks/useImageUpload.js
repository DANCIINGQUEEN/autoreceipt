import { useState } from "react";
import { deduplicateFiles } from "../utils/deduplicateFiles";
import { validateImageSize } from "../utils/validateImageSize";

export function useImageUpload() {
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);

  const handleImageUpload = async (e) => {
    const rawFiles = [...e.target.files];
    const files = deduplicateFiles(rawFiles);

    const validated = await Promise.all(
      files.map(async (file) => {
        const check = await validateImageSize(file);
        return {
          filename: file.name,
          file,
          ocrStatus: check.valid ? "대기중" : "실패",
          gptStatus: check.valid ? "대기중" : "실패",
          parsed: check.valid
            ? null
            : { error: check.reason || "❌ 이미지 크기 오류" },
        };
      })
    );

    const accepted = validated.filter((v) => v.ocrStatus === "대기중");
    setImages(accepted.map((v) => v.file));
    setResults(validated);
  };

  return { images, results, setResults, handleImageUpload };
}
