import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from '../services/github.service';
import { IDeployment } from '../models/deployment.interface';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('deployment-frequency')
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

  // Add other DORA metric routes here
}
