import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller()
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('deployment-frequency')
  getDeploymentFrequency(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('limit') limit: number = 10,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    // return this.githubService.getDeploymentFrequency(owner, repo, limit, order);
    // return a response saying hello world
    return 'Hello World';
  }

  // Add other DORA metric routes here
}
