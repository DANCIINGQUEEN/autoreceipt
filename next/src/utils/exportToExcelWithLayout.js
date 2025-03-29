import { read, utils, writeFile } from "xlsx";

export async function exportToExcelWithLayout(results, templateFile) {
  const buffer = await templateFile.arrayBuffer();
  const workbook = read(buffer, { type: "array" });

  const sorted = results
    .filter((r) => r.parsed && !r.parsed.error)
    .sort((a, b) => new Date(a.parsed.date) - new Date(b.parsed.date));

  const positions = [
    { img: "A4", cells: ["B18", "B19", "B20", "B21", "B22"] },
    { img: "C4", cells: ["D18", "D19", "D20", "D21", "D22"] },
    { img: "A23", cells: ["B37", "B38", "B39", "B40", "B41"] },
    { img: "C23", cells: ["D37", "D38", "D39", "D40", "D41"] },
  ];

  const sheetCount = Math.ceil(sorted.length / 4);
  const baseSheetName = workbook.SheetNames[0];

  if (sheetCount > workbook.SheetNames.length) {
    alert("시트 수가 부족합니다. 템플릿에 시트를 더 추가해 주세요.");
    return;
  }

  sorted.forEach((res, idx) => {
    const sheetIndex = Math.floor(idx / 4);
    const posIndex = idx % 4;
    const { img, cells } = positions[posIndex];

    const sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];
    const p = res.parsed;

    const [date, name, purpose, time, amount] = [
      p.date,
      p.name,
      p.purpose,
      p.leave_time,
      p.limited_amount,
    ];

    sheet[cells[0]] = { t: "s", v: date };
    sheet[cells[1]] = { t: "s", v: name };
    sheet[cells[2]] = { t: "s", v: purpose };
    sheet[cells[3]] = { t: "s", v: time };
    sheet[cells[4]] = { t: "n", v: amount };
  });

  writeFile(workbook, "개인경비청구내역_완성본.xlsx");
}
