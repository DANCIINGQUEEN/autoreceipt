export const statusIcon = (status) => {
  switch (status) {
    case "대기중":
      return "⏳";
    case "분석중":
      return "🔄";
    case "완료":
      return "✅";
    case "실패":
      return "❌";
    default:
      return "";
  }
};
