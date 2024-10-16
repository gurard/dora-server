import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller()
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('deployment-frequency')
  getDeploymentFrequency(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('env') env: string,
  ) {
    return this.githubService.getDeploymentFrequency(owner, repo, env);
  }

  // Add other DORA metric routes here
}
