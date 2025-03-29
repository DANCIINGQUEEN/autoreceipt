import { useState, useEffect } from "react";
import { statusIcon } from "../utils/statusIcon";
import { gptLoadingText } from "../utils/gptLoadingText";

export default function ReceiptCard({ res, dotCycle, onChange }) {
  const [parsed, setParsed] = useState(res.parsed || {});
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let initial = res.parsed || {};

    // is_fnb && 목적 없음이면 자동 설정 + 상위에 알리기
    if (initial.is_fnb && !initial.purpose) {
      initial = { ...initial, purpose: "야근식대" };
      setParsed(initial);
      onChange?.(initial); // 🔥 실제 데이터에 반영!
    } else {
      setParsed(initial);
    }
  }, [res.parsed]);

  const handleChange = (key, value) => {
    const updated = { ...parsed, [key]: value };
    setParsed(updated);
    onChange?.(updated);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div className="p-4 transition-all bg-white border rounded shadow hover:shadow-md dark:bg-zinc-800 dark:border-zinc-700">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={URL.createObjectURL(res.file)}
          alt={res.filename}
          onClick={() => setIsModalOpen(true)}
          className="object-cover w-20 h-20 border border-gray-300 rounded cursor-pointer dark:border-zinc-600"
        />
        <div className="flex-1">
          <p className="font-semibold">{res.filename}</p>
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            OCR: {statusIcon(res.ocrStatus)} {res.ocrStatus}
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            GPT: {statusIcon(res.gptStatus)}{" "}
            {res.gptStatus === "분석중"
              ? `분석중${gptLoadingText(dotCycle)}`
              : res.gptStatus}
          </p>
          {parsed?.is_fnb && (
            <p className="mt-1 text-sm font-medium text-green-500">
              🍽 음식점으로 판단됨
            </p>
          )}
          {parsed?.is_fnb === false && (
            <p className="mt-1 text-sm font-medium text-red-500">
              ❗ 항목 수정이 필요합니다!
            </p>
          )}
        </div>
      </div>

      {parsed?.error && (
        <p className="mt-2 text-sm font-medium text-red-500">{parsed.error}</p>
      )}

      {res.gptStatus === "완료" && !parsed?.error && (
        <div className="space-y-3 text-sm">
          {[
            { label: "결제일자", key: "date", type: "date" },
            { label: "이름", key: "name" },
            { label: "목적 및 내용", key: "purpose" },
            { label: "퇴근 시간", key: "leave_time" },
            { label: "금액", key: "limited_amount" },
          ].map(({ label, key, type }) => (
            <div
              key={key}
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
            >
              <label className="w-32 font-medium shrink-0">{label}</label>
              <input
                type={type || "text"}
                value={parsed[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
                className={`flex-1 p-2 border rounded dark:bg-zinc-700 dark:text-zinc-100
                  ${
                    parsed?.is_fnb === false
                      ? "border-red-500 ring-1 ring-red-500"
                      : "border-gray-300 dark:border-zinc-600"
                  }
                `}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-3xl p-4 bg-white rounded shadow-lg dark:bg-zinc-800">
            <img
              src={URL.createObjectURL(res.file)}
              alt="확대 이미지"
              className="w-full h-auto max-h-[80vh] object-contain rounded"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="block px-4 py-2 mx-auto mt-4 text-white bg-red-500 rounded hover:bg-red-600"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
