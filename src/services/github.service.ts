import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class GithubService {
  private readonly platformUrl = 'https://api.github.com';
  private readonly token = process.env.DORA_GITHUB_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async fetchPaginatedData(url: string) {
    let results: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await firstValueFrom(
        this.httpService.get(`${url}&page=${page}`, {
          headers: this.getHeaders(),
        }),
      );
      results = results.concat(response.data);
      hasMore =
        response.headers['link'] &&
        response.headers['link'].includes('rel="next"');
      page++;
    }

    return results;
  }

  async getDeployments(
    owner: string,
    repo: string,
    env: string,
  ): Promise<any[]> {
    const url = `${this.platformUrl}/repos/${owner}/${repo}/deployments?environment=${env}`;
    let deployments = await this.fetchPaginatedData(url);

    return deployments;
  }

  async getLeadTime(owner: string, repo: string): Promise<any> {
    try {
      const deployments = await this.getDeployments(owner, repo, 'prod');
      const recentDeployments = deployments.filter((deployment) => {
        const deploymentDate = moment(deployment.created_at);
        return deploymentDate.isAfter(
          moment().subtract(10, 'weeks').startOf('week'),
        );
      });

      const deploymentLeadTimes: { date: string; leadTimeDays: number }[] = [];

      for (const deployment of recentDeployments) {
        // Fetch the PR associated with the deployment's commit SHA (sprint branch to master)
        const prResponse = await firstValueFrom(
          this.httpService.get(
            `${this.platformUrl}/repos/${owner}/${repo}/pulls`,
            {
              headers: this.getHeaders(),
              params: {
                state: 'closed',
                base: 'master',
                head: deployment.sha,
                per_page: 100,
              },
            },
          ),
        );

        const sprintToMasterPRs = prResponse.data;

        for (const sprintPR of sprintToMasterPRs) {
          if (sprintPR.merged_at) {
            // Fetch pull requests merged into this sprint branch (feature branches)
            const featureToSprintPRsResponse = await firstValueFrom(
              this.httpService.get(
                `${this.platformUrl}/repos/${owner}/${repo}/pulls`,
                {
                  headers: this.getHeaders(),
                  params: {
                    state: 'closed',
                    base: sprintPR.head.ref,
                    per_page: 100,
                  },
                },
              ),
            );

            const featureToSprintPRs = featureToSprintPRsResponse.data;

            for (const featurePR of featureToSprintPRs) {
              if (featurePR.merged_at) {
                // Fetch commits from the feature branch
                const commitsResponse = await firstValueFrom(
                  this.httpService.get(
                    `${this.platformUrl}/repos/${owner}/${repo}/commits`,
                    {
                      headers: this.getHeaders(),
                      params: {
                        sha: featurePR.head.sha,
                        per_page: 100,
                      },
                    },
                  ),
                );

                const commits = commitsResponse.data;

                if (commits.length > 0) {
                  // Find the earliest commit date in the feature branch
                  const earliestCommitDate = new Date(
                    commits[commits.length - 1].commit.author.date,
                  ).getTime();
                  const deploymentDate = new Date(
                    deployment.created_at,
                  ).getTime();

                  // Calculate lead time
                  const leadTime = deploymentDate - earliestCommitDate;
                  const leadTimeDays = leadTime / 86_400_000; // Convert to days

                  deploymentLeadTimes.push({
                    date: moment(deployment.created_at).format('YYYY-MM-DD'),
                    leadTimeDays,
                  });
                }
              }
            }
          }
        }
      }

      return { deploymentLeadTimes };
    } catch (error) {
      console.error('Error fetching data from GitHub:', error);
      return [];
    }
  }

  // Add other DORA metrics methods here
}
