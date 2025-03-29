"use client";
import { useState, useEffect } from "react";
import { gptLoadingText } from "../utils/gptLoadingText";
import { useTemplateUpload } from "../hooks/useTemplateUpload";
import { useImageUpload } from "../hooks/useImageUpload";
import { useProcessReceipts } from "../hooks/useProcessReceipts";
import { exportToExcelWithLayout } from "../utils/exportToExcelWithLayout";
import ReceiptCard from "../components/ReceiptCard";

export default function Home() {
  const { templateFile, handleTemplateUpload } = useTemplateUpload();
  const { images, results, setResults, handleImageUpload } = useImageUpload();
  const [dotCycle, setDotCycle] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { processReceipts } = useProcessReceipts(
    results,
    setResults,
    setIsAnalyzing
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCycle((prev) => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleExport = async () => {
    const filtered = results.filter((r) => r.parsed && !r.parsed.error);
    const sorted = [...filtered].sort(
      (a, b) => new Date(a.parsed.date) - new Date(b.parsed.date)
    );

    const metadata = sorted.map((r) => ({
      filename: r.filename,
      ...r.parsed,
    }));

    const formData = new FormData();
    formData.append("metadata", JSON.stringify(metadata));
    sorted.forEach((r) => formData.append("files", r.file));

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export`, {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "개인경비청구내역_완성본.xlsx";
    a.click();
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-zinc-900 dark:text-zinc-100">
      <h1 className="mb-4 text-2xl font-bold text-blue-800 dark:text-blue-300">
        🧾 영수증 자동 분석기
      </h1>

      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          영수증을 업로드해주세요
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full p-2 text-sm text-gray-700 border border-gray-300 rounded dark:text-zinc-300"
        />
      </div>
      <button
        onClick={processReceipts}
        disabled={images.length === 0 || isAnalyzing}
        className={`px-4 py-2 rounded text-white transition-all ${
          isAnalyzing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-400 dark:hover:bg-blue-500"
        }`}
      >
        {isAnalyzing ? `분석 중${gptLoadingText(dotCycle)}` : "전체 분석 시작"}
      </button>

      <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2">
        {results.map((res, i) => (
          <ReceiptCard
            key={i}
            res={res}
            dotCycle={dotCycle}
            onChange={(updatedParsed) => {
              const newResults = [...results];
              newResults[i].parsed = updatedParsed;
              setResults(newResults);
            }}
          />
        ))}
      </div>
      <button
        onClick={handleExport}
        disabled={
          results.length === 0 ||
          results.some(
            (r) => r.gptStatus !== "완료" || !r.parsed || r.parsed.error
          )
        }
        className="px-4 py-2 mt-8 text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {results.some((r) => r.gptStatus !== "완료")
          ? "모든 분석 완료 후 다운로드 가능"
          : "엑셀로 다운로드"}
      </button>
    </div>
  );
}
