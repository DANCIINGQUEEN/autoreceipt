export function gptLoadingText(dotCycle) {
  const loadingDots = [".", "..", "..."];
  return loadingDots[dotCycle % loadingDots.length];
}
