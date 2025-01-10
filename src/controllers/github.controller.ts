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

  @Get('change-lead-time')
  async getChangeLeadTime(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('env') env: string,
    @Query('branch') branch: string,
  ) {
    // Fetch data from GitHub
    console.log('fetching deployments');
    const deployments = await this.githubService.getDeployments(
      owner,
      repo,
      env,
    );
    console.log('deployments', deployments.length);

    console.log('fetching pull requests');
    const pullRequests = await this.githubService.getPullRequests(
      owner,
      repo,
      branch,
    );
    console.log('pull requests', pullRequests.length);

    // Filter deployments to the past 10 weeks
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);

    const recentDeployments = deployments.filter((deployment) => {
      const createdAt = new Date(deployment.created_at);
      return createdAt >= tenWeeksAgo;
    });

    // Calculate lead times
    const leadTimes = await Promise.all(
      recentDeployments.map(async (deployment) => {
        const deployedAt = new Date(deployment.created_at);
        const relatedPullRequests = pullRequests.filter((pr) => {
          const mergedAt = new Date(pr.merged_at);
          return mergedAt <= deployedAt;
        });

        if (relatedPullRequests.length === 0) return null;

        let earliestCommitDate = null;

        for (let i = 0; i < relatedPullRequests.length; i++) {
          const pr = relatedPullRequests[i];
          console.log('fetching commits');
          const commits = await this.githubService.getCommits(
            owner,
            repo,
            pr.number,
          );
          console.log('commits', commits.length);
          for (const commit of commits) {
            // Skip merge commits
            if (commit.parents.length > 1) continue;

            const commitDate = new Date(commit.commit.author.date);
            if (!earliestCommitDate || commitDate < earliestCommitDate) {
              earliestCommitDate = commitDate;
            }
          }
        }

        if (!earliestCommitDate) return null;

        const leadTime = deployedAt.getTime() - earliestCommitDate.getTime();
        return leadTime / (1000 * 60 * 60 * 24); // Convert milliseconds to days
      }),
    );

    // Filter out null values and calculate average lead time
    const validLeadTimes = leadTimes.filter((leadTime) => leadTime !== null);
    const averageLeadTime =
      validLeadTimes.reduce((total, lt) => total + lt, 0) /
      validLeadTimes.length;

    return { averageLeadTime, leadTimes: validLeadTimes };
  }

  // Add other DORA metric routes here
}
