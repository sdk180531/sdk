import Constants from 'expo-constants';

const API_KEY: string = Constants.expoConfig?.extra?.kakaoApiKey ?? '';
const BASE_URL = 'https://dapi.kakao.com/v2/local/search/address.json';

interface KakaoAddress {
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

interface KakaoDocument {
  address: KakaoAddress | null;
}

interface KakaoResponse {
  documents: KakaoDocument[];
}

export interface SearchLocation {
  id: number;
  name_ko: string;
  district: string;
  province: string;
}

export async function searchDong(query: string): Promise<SearchLocation[]> {
  if (!API_KEY) throw new Error('Kakao API key not configured');

  const params = new URLSearchParams({ query, analyze_type: 'similar', size: '30' });
  const res = await fetch(`${BASE_URL}?${params}`, {
    headers: { Authorization: `KakaoAK ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`Kakao API ${res.status}`);

  const json: KakaoResponse = await res.json();

  const seen = new Set<string>();
  return json.documents
    .filter(d => (d.address?.region_3depth_name?.length ?? 0) > 0)
    .filter(d => {
      const key = `${d.address!.region_3depth_name}|${d.address!.region_2depth_name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((d, i) => ({
      id: i,
      name_ko: d.address!.region_3depth_name,
      district: d.address!.region_2depth_name,
      province: d.address!.region_1depth_name,
    }));
}
