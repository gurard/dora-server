import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { AzureDevOpsService } from '../services/azuredevops.service';

@Controller('deployment-frequency')
export class DeploymentFrequencyController {
  constructor(
    private readonly githubService: GithubService,
    private readonly azureDevopsService: AzureDevOpsService,
  ) {}

  @Get('github')
  getDeploymentsGithub(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('env') env: string,
  ) {
    return this.githubService.getDeployments(owner, repo, env);
  }

  @Get('azure')
  getDeploymentsAzure(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('env') env: string,
  ) {
    return this.azureDevopsService.getDeployments(owner, repo, env);
  }

  // Add other DORA metric routes here
}
