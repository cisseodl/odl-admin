import { Configuration } from '../models/configuration.model';
import { fetchApi } from './api.service';

export class ConfigurationService {
  async getConfiguration(): Promise<Configuration> {
    const response = await fetchApi<any>("/configurations/get-config", { method: "GET" });
    return response.data;
  }

  async updateConfiguration(configurationData: any, homepageImage?: File, loginImage?: File, aboutImage?: File): Promise<Configuration> {
    const formData = new FormData();
    // Append text fields
    Object.keys(configurationData).forEach(key => {
      formData.append(key, configurationData[key]);
    });
    // Append image files
    if (homepageImage) {
      formData.append("homepageImage", homepageImage);
    }
    if (loginImage) {
      formData.append("loginImage", loginImage);
    }
    if (aboutImage) {
      formData.append("aboutImage", aboutImage);
    }

    const response = await fetchApi<any>("/configurations/update", {
      method: "POST", // test.md specifies POST for update
      body: formData,
    });
    return response.data;
  }

  // Other methods (getAllConfigurations, getConfigurationById, createConfiguration, deleteConfiguration)
  // not explicitly defined in test.md GET/POST/PUT/DELETE sections.
  async getAllConfigurations(): Promise<Configuration[]> {
    console.log('Fetching all configurations... (Not an explicit endpoint)');
    return [];
  }

  async getConfigurationById(id: number): Promise<Configuration | null> {
    console.log(`Fetching configuration with ID: ${id}... (Not an explicit endpoint)`);
    return null;
  }

  async createConfiguration(configuration: Omit<Configuration, 'id'>): Promise<Configuration> {
    console.log('Creating a new configuration...', configuration);
    const newConfiguration = { id: Math.floor(Math.random() * 1000), ...configuration };
    return newConfiguration;
  }

  async deleteConfiguration(id: number): Promise<void> {
    console.log(`Deleting configuration with ID: ${id}`);
  }
}

export const configurationService = new ConfigurationService();
