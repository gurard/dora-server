import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { AzureDevOpsService } from '../services/azuredevops.service';
import { IDeployment } from '../models/deployment.interface';

@Controller('deployment-frequency')
export class DeploymentFrequencyController {
  constructor(
    private readonly githubService: GithubService,
    private readonly azureDevopsService: AzureDevOpsService,
  ) {}

  @Get('github')
  async getDeploymentsGithub(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('env') env: string,
  ) {
    let response: IDeployment[] = [];
    let deployments = await this.githubService.getDeployments(owner, repo, env);

    deployments.map((deployment) => {
      response.push({ deploymentDate: deployment.created_at });
    });

    return response;
  }

  @Get('azure')
  async getDeploymentsAzure(
    @Query('org') org: string,
    @Query('project') project: string,
    @Query('pipeline') pipeline: string,
    @Query('env') env: string,
  ) {
    let response: IDeployment[] = [];

    let deployments = await this.azureDevopsService.getDeployments(
      org,
      project,
    );

    // Filter for specific pipeline
    let filteredReleases = deployments.filter(
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
            response.push({ deploymentDate: lastStep.lastModifiedOn });
          }
        }
      }
    }

    return response;
  }

  // Add other DORA metric routes here
}
