import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AzureDevOpsService {
  private readonly platformUrl = 'https://vsrm.dev.azure.com';
  private readonly token = process.env.DORA_AZURE_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(`:${this.token}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  async getDeployments(org: string, project: string) {
    const encodedOrg = encodeURIComponent(org);
    const encodedProject = encodeURIComponent(project);
    const url = `${this.platformUrl}/${encodedOrg}/${encodedProject}/_apis/release/releases?api-version=7.1&$expand=environments`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        }),
      );
      const deployments = response.data.value;

      return deployments;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw new Error('Failed to fetch deployments');
    }
  }
}
