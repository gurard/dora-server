import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AzureDevOpsService {
  private readonly platformUrl = 'https://vsrm.dev.azure.com';
  private readonly token = process.env.TOKEN_AZURE_DEVOPS;

  private getHeaders() {
    return {
      Authorization: `Basic ${Buffer.from(`:${this.token}`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  async getDeployments(
    org: string,
    project: string,
    pipeline: string,
    env: string,
  ) {
    const encodedOrg = encodeURIComponent(org);
    const encodedProject = encodeURIComponent(project);

    const url = `${this.platformUrl}/${encodedOrg}/${encodedProject}/_apis/release/releases?api-version=7.1&$expand=environments`;

    try {
      const response = await axios.get(url, { headers: this.getHeaders() });
      const releases = response.data.value;

      // Filter for specific pipeline
      let filteredReleases = releases.filter(
        (release) => release.releaseDefinition.name === pipeline,
      );

      // Filter for specific environment
      filteredReleases = filteredReleases.filter((release) =>
        release.environments.some(
          (environment) =>
            environment.name.toLowerCase() === env.toLowerCase() &&
            environment.status === 'succeeded',
        ),
      );

      return filteredReleases;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw new Error('Failed to fetch deployments');
    }
  }
}
