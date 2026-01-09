import { fetchApi } from "./api.service";

export class LearnerModuleService {
  async saveLearnerModule(
    userId: number,
    moduleId: number,
    coursId: number
  ): Promise<any> {
    const formData = new URLSearchParams();
    formData.append("userId", userId.toString());
    formData.append("moduleId", moduleId.toString());
    formData.append("coursId", coursId.toString());

    const response = await fetchApi<any>("/learnermodule/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    return response.data || response;
  }
}

export const learnerModuleService = new LearnerModuleService();
