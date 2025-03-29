export const deduplicateFiles = (files) => {
  const seen = new Set();
  return files.filter((file) => {
    const already = seen.has(file.name);
    seen.add(file.name);
    return !already;
  });
};
