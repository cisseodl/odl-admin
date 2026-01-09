import { fetchApi } from "./api.service";

export class FileService {
  async uploadFile(file: File, folderName = "test"): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderName", folderName);

    const response = await fetchApi<any>("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    return response.data || response;
  }

  async getPresignedUrl(
    fileName: string,
    fileType: string,
    folder = ""
  ): Promise<any> {
    const response = await fetchApi<any>(
      `/api/files/presigned-url?fileName=${encodeURIComponent(
        fileName
      )}&fileType=${encodeURIComponent(fileType)}&folder=${encodeURIComponent(
        folder
      )}`,
      { method: "GET" }
    );
    return response.data || response;
  }

  async serveFile(filename: string): Promise<any> {
    const response = await fetchApi<any>(
      `/api/files/${encodeURIComponent(filename)}`,
      { method: "GET" }
    );
    return response;
  }

  async downloadFromFolder(folderName: string, fileName: string): Promise<any> {
    // This endpoint streams the file directly as a download
    const response = await fetch(
      `${"http://localhost:8080"}/downloads/${encodeURIComponent(
        folderName
      )}/${encodeURIComponent(fileName)}`
    );
    if (!response.ok) throw new Error("File download failed");
    const blob = await response.blob();
    return blob;
  }
}

export const fileService = new FileService();
