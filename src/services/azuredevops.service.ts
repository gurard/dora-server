import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AzureDevOpsService {
  private readonly orgUrl = 'https://dev.azure.com/{organization}';
  private readonly project = '{project}';
  private readonly token = '{personal-access-token}'; // Replace with your PAT

  private getHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(`:${this.token}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchDeployments() {
    const url = `${this.orgUrl}/${this.project}/_apis/release/releases?api-version=6.0`;
    try {
      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw new Error('Failed to fetch deployments');
    }
  }
}
