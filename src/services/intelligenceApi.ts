const API_BASE_URL = 'http://127.0.0.1:8000';

export interface IntelligenceRequest {
  company_name: string;
  country: string;
}

export interface IntelligenceResponse {
  success: boolean;
  company_name: string;
  country: string;
  golden_record: Record<string, any>;
}

/**
 * Triggers the LangGraph orchestration pipeline via FastAPI
 */
export async function generateIntelligence(payload: IntelligenceRequest): Promise<IntelligenceResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/company-intelligence/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate company intelligence');
  }

  return response.json();
}