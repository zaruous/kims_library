import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  let apiKey: string | undefined;
  
  try {
    // Check if process exists to avoid "ReferenceError: process is not defined" in browser environments
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment variable access failed", e);
  }

  if (!apiKey) {
    console.warn("API_KEY is not set. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const summarizeDocument = async (content: string, docType: 'md' | 'pdf'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI 서비스를 사용할 수 없습니다. (API Key 설정 필요)";

  try {
    const prompt = `
      다음 문서의 내용을 독자가 이해하기 쉽게 요약해 주세요. 
      문서 형식: ${docType}
      
      내용:
      ${content.substring(0, 10000)} ${content.length > 10000 ? '...(truncated)' : ''}
      
      요약은 명확하고 간결하게 작성해주세요. 한국어로 답변해 주세요.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "요약을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "요약 중 오류가 발생했습니다.";
  }
};

export const askLibrarian = async (query: string, contextContent: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI 서비스를 사용할 수 없습니다. (API Key 설정 필요)";
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          당신은 이 고풍스러운 도서관의 지혜로운 사서(Librarian)입니다.
          사용자의 질문에 대해 아래 제공된 문서 내용을 바탕으로 답변해 주세요.
          문서 내용이 답변에 충분하지 않다면 일반적인 지식을 동원하되, 문서에 없다는 점을 언급하세요.
          
          문서 내용:
          ${contextContent.substring(0, 15000)}
          
          사용자 질문: ${query}
          
          답변은 정중하고 지적인 사서의 어조로 해주세요.
        `,
      });
  
      return response.text || "답변을 생성할 수 없습니다.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "사서가 바빠서 지금은 답변할 수 없습니다.";
    }
  };