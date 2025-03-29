export const validateImageSize = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const { width, height } = img;
      const isTooSmall = width < 100 || height < 100;
      const isTooBig = width > 5000 || height > 5000;

      resolve({
        valid: !isTooSmall && !isTooBig,
        width,
        height,
        reason: isTooSmall
          ? "❌ 이미지가 너무 작습니다."
          : isTooBig
          ? "❌ 이미지가 너무 큽니다."
          : null,
      });
    };
  });
