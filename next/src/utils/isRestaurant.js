export async function isRestaurantByPlaceName(placeName) {
  const query = encodeURIComponent(placeName);
  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?page=1&size=15&sort=accuracy&query=${query}`,
    {
      headers: {
        Authorization: `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY}`,
      },
    }
  );

  const data = await res.json();
  const firstMatch = data.documents?.[0];
  if (!firstMatch) return false;

  return firstMatch.category_group_code === "FD6"; // FD6 = 음식점
}
