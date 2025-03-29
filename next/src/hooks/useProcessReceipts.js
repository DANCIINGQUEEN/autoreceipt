import Tesseract from "tesseract.js";
import { analyzeTextWithGpt } from "../utils/analyzeTextWithGpt";
import { isRestaurantByPlaceName } from "../utils/isRestaurant";

export function useProcessReceipts(results, setResults, setIsAnalyzing) {
  const processReceipts = async () => {
    setIsAnalyzing(true);
    const updatedResults = [...results];

    const getRandomTime = () => {
      const times = [
        "19:00",
        "19:30",
        "20:00",
        "20:30",
        "21:00",
        "21:30",
        "22:00",
        "22:30",
      ];
      const randomIndex = Math.floor(Math.random() * times.length);
      return times[randomIndex];
    };

    const userName = prompt("이름을 입력하세요:") || "사용자";

    for (let i = 0; i < updatedResults.length; i++) {
      updatedResults[i].ocrStatus = "분석중";
      setResults([...updatedResults]);

      const {
        data: { text },
      } = await Tesseract.recognize(updatedResults[i].file, "kor+eng");

      updatedResults[i].ocrStatus = "완료";
      setResults([...updatedResults]);

      updatedResults[i].gptStatus = "분석중";
      setResults([...updatedResults]);

      try {
        const parsed = await analyzeTextWithGpt(text);
        parsed.name = userName;
        parsed.leave_time = getRandomTime();

        if (parsed?.store_name) {
          const isFnb = await isRestaurantByPlaceName(parsed.store_name);
          parsed.is_fnb = isFnb;
          parsed.limited_amount =
            isFnb && parsed.total_amount > 10000 ? 10000 : parsed.total_amount;
        } else {
          parsed.is_fnb = false;
          parsed.limited_amount = parsed.total_amount;
        }

        updatedResults[i].gptStatus = "완료";
        updatedResults[i].parsed = parsed;
      } catch (err) {
        updatedResults[i].gptStatus = "실패";
        updatedResults[i].parsed = { error: "GPT 분석 실패" };
      }

      setResults([...updatedResults]);
    }

    setIsAnalyzing(false);
  };

  return { processReceipts };
}
