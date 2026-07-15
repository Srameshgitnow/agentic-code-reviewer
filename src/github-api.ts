import axios from 'axios';
import { config } from './config';

export class GitHubAPI {
  private token: string;
  private baseURL = 'https://api.github.com';

  constructor() {
    this.token = config.github.token;
  }

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async getPullRequestDiff(
    repoOwner: string,
    repoName: string,
    prNumber: number
  ): Promise<string> {
    try {
      const url = `${this.baseURL}/repos/${repoOwner}/${repoName}/pulls/${prNumber}`;
      const response = await axios.get(url, {
        headers: {
          ...this.getHeaders(),
          Accept: 'application/vnd.github.v3.diff',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get PR diff:', error);
      throw error;
    }
  }

  async getModifiedFiles(
    repoOwner: string,
    repoName: string,
    prNumber: number
  ): Promise<Array<{ filename: string; patch: string; status: string }>> {
    try {
      const url = `${this.baseURL}/repos/${repoOwner}/${repoName}/pulls/${prNumber}/files`;
      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('Failed to get modified files:', error);
      throw error;
    }
  }

  async postComment(
    repoOwner: string,
    repoName: string,
    prNumber: number,
    body: string
  ): Promise<number> {
    try {
      const url = `${this.baseURL}/repos/${repoOwner}/${repoName}/issues/${prNumber}/comments`;
      const response = await axios.post(
        url,
        { body },
        { headers: this.getHeaders() }
      );
      return response.data.id;
    } catch (error) {
      console.error('Failed to post comment:', error);
      throw error;
    }
  }

  async updateComment(
    repoOwner: string,
    repoName: string,
    commentId: number,
    body: string
  ): Promise<void> {
    try {
      const url = `${this.baseURL}/repos/${repoOwner}/${repoName}/issues/comments/${commentId}`;
      await axios.patch(
        url,
        { body },
        { headers: this.getHeaders() }
      );
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  async getFileContent(
    repoOwner: string,
    repoName: string,
    filePath: string,
    ref: string
  ): Promise<string> {
    try {
      const url = `${this.baseURL}/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        params: { ref },
      });
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Failed to get file content:', error);
      throw error;
    }
  }
}

export const githubAPI = new GitHubAPI();
