import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { IDeployment } from '../models/deployment.interface';

@Injectable()
export class AzureDevOpsService {
  private readonly platformUrl = 'https://vsrm.dev.azure.com';
  private readonly token = process.env.DORA_AZURE_TOKEN;

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
    let deployments: IDeployment[] = [];
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

      // filter for specific environment
      for (let i = 0; i < filteredReleases.length; ++i) {
        let release = filteredReleases[i];

        // find env of the release and make sure it has succeeded (filter out pending)
        const releaseEnv = release.environments.find(
          (environment) =>
            environment.name.toLowerCase() === env.toLowerCase() &&
            environment.status === 'succeeded',
        );

        if (releaseEnv) {
          // deployment time is determined by timestamp of final step in deployment
          if (releaseEnv.deploySteps && releaseEnv.deploySteps.length > 0) {
            const lastStep =
              releaseEnv.deploySteps[releaseEnv.deploySteps.length - 1];
            if (lastStep && lastStep.lastModifiedOn) {
              deployments.push({ deploymentDate: lastStep.lastModifiedOn });
            }
          }
        }
      }

      // return deploymentsWithCompletionTime;
      return deployments;
    } catch (error) {
      console.error('Error fetching deployments:', error);
      throw new Error('Failed to fetch deployments');
    }
  }
}
