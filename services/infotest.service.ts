import { InfoTest } from '../models/infotest.model';
import { fetchApi } from './api.service';

export class InfoTestService {
  // No explicit endpoints for infotest in test.md. Keeping as stubs.
  async getAllInfoTests(): Promise<InfoTest[]> {
    console.log('Fetching all infoTests... (No explicit endpoint)');
    return [];
  }

  async getInfoTestById(id: number): Promise<InfoTest | null> {
    console.log(`Fetching infoTest with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createInfoTest(infoTest: Omit<InfoTest, 'id'>): Promise<InfoTest> {
    console.log('Creating a new infoTest...', infoTest);
    const newInfoTest = { id: Math.floor(Math.random() * 1000), ...infoTest };
    return newInfoTest;
  }

  async updateInfoTest(id: number, infoTestData: Partial<InfoTest>): Promise<InfoTest | null> {
    console.log(`Updating infoTest with ID: ${id}`, infoTestData);
    return null;
  }

  async deleteInfoTest(id: number): Promise<void> {
    console.log(`Deleting infoTest with ID: ${id}`);
  }
}

export const infoTestService = new InfoTestService();
