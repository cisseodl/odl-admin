import { fetchApi } from "./api.service";

export class AnswerService {
  async saveAnswer(answer: any): Promise<any> {
    const response = await fetchApi<any>("/answers/save", {
      method: "POST",
      body: answer,
    });
    return response.data || response;
  }

  async saveLearnerTest(payload: any): Promise<any> {
    const response = await fetchApi<any>("/answers/save-learner-test", {
      method: "POST",
      body: payload,
    });
    return response.data || response;
  }

  async getAll(): Promise<any> {
    const response = await fetchApi<any>("/answers/get-all", { method: "GET" });
    return response.data || response;
  }
}

export const answerService = new AnswerService();
