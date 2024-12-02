import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AzureDevOpsService {
  private readonly platformUrl = 'https://vsrm.dev.azure.com';
  // private readonly project = '{project}';
  private readonly projectURLEncoded = '';
  private readonly token = process.env.TOKEN_AZURE_DEVOPS;

  private getHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(`:${this.token}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  async getDeployments(owner: string, project: string, env: string) {
    const url = `${this.platformUrl}/${owner}/${this.projectURLEncoded}/_apis/release/releases?api-version=7.1`;

    console.log('url', url);
    try {
      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw new Error('Failed to fetch deployments');
    }
  }
}
