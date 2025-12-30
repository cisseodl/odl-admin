import { UserDb } from '../models/user-db.model'; // Use UserDb for backend interaction
import { fetchApi } from './api.service';

export class UserService {
  async getAllUsers(page: number, size: number): Promise<{ content: UserDb[], totalElements: number }> {
    const response = await fetchApi<any>(`/users/get-all/${page}/${size}`, { method: "GET" });
    return response.data;
  }

  async checkUserByPhone(phone: string): Promise<boolean> {
    const response = await fetchApi<any>(`/users/check/${phone}`, { method: "GET" });
    return response.data;
  }

  // Other methods (getUserById, createUser, updateUser, deleteUser) not explicitly defined in test.md.
  async getUserById(id: number): Promise<UserDb | null> {
    console.log(`Fetching user with ID: ${id}... (No explicit endpoint)`);
    return null;
  }

  async createUser(user: Omit<UserDb, 'id'>): Promise<UserDb> {
    console.log('Creating a new user...', user);
    const newUser = { id: Math.floor(Math.random() * 1000), ...user };
    return newUser;
  }

  async updateUser(id: number, userData: Partial<UserDb>): Promise<UserDb | null> {
    console.log(`Updating user with ID: ${id}`, userData);
    return null;
  }

  async deleteUser(id: number): Promise<void> {
    console.log(`Deleting user with ID: ${id}`);
  }
}

export const userService = new UserService();
