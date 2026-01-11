import { GoogleGenerativeAI } from "@google/generative-ai";

// Access environment variables safely
const getApiKey = () => {
  // 1. Try Vite's import.meta.env (Standard way)
  if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // 2. Try process.env (Defined in vite.config.ts)
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
  }

  return undefined;
};

const getAiClient = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env file.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const summarizeDocument = async (content: string, docType: 'md' | 'pdf'): Promise<string> => {
  const genAI = getAiClient();
  if (!genAI) return "AI 서비스를 사용할 수 없습니다. (.env 파일에 API Key 설정 필요)";

  try {
    // Use a stable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      다음 문서의 내용을 독자가 이해하기 쉽게 요약해 주세요. 
      문서 형식: ${docType}
      
      내용:
      ${content.substring(0, 10000)} ${content.length > 10000 ? '...(truncated)' : ''}
      
      요약은 명확하고 간결하게 작성해주세요. 한국어로 답변해 주세요.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return `요약 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};

export const askLibrarian = async (query: string, contextContent: string): Promise<string> => {
    const genAI = getAiClient();
    if (!genAI) return "AI 서비스를 사용할 수 없습니다. (.env 파일에 API Key 설정 필요)";
  
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        당신은 이 고풍스러운 도서관의 지혜로운 사서(Librarian)입니다.
        사용자의 질문에 대해 아래 제공된 문서 내용을 바탕으로 답변해 주세요.
        문서 내용이 답변에 충분하지 않다면 일반적인 지식을 동원하되, 문서에 없다는 점을 언급하세요.
        
        문서 내용:
        ${contextContent.substring(0, 15000)}
        
        사용자 질문: ${query}
        
        답변은 정중하고 지적인 사서의 어조로 해주세요.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini Error:", error);
      return `죄송합니다. 오류가 발생하여 답변해 드릴 수 없습니다: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };
