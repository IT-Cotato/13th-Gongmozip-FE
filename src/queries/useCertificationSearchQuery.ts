import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

export type CertificationSearchItem = {
  certificationCode: string;
  certificateName: string;
  categoryCode: string;
  categoryName: string;
};

export type CertificationSearchResponse = {
  certifications: CertificationSearchItem[];
  allowCustomInput: boolean;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

function fetchCertificationSearch(keyword: string, categoryCode: string | null) {
  const params = new URLSearchParams({ keyword, size: "20" });
  if (categoryCode) params.set("category", categoryCode);

  return apiFetch<CertificationSearchResponse>(`/api/certifications?${params.toString()}`);
}

export function useCertificationSearchQuery(keyword: string, categoryCode: string | null) {
  return useQuery({
    queryKey: ["certifications", "search", keyword, categoryCode],
    queryFn: () => fetchCertificationSearch(keyword, categoryCode),
    enabled: keyword.length > 0,
    staleTime: 60_000,
  });
}
