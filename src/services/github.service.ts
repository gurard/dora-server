import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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

  async fetchPaginatedData(url: string, params: any = {}) {
    let results: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      console.log(`fetching url ${url}&page=${page}`);
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

  async getPullRequests(owner: string, repo: string, branch: string) {
    const url = `${this.platformUrl}/repos/${owner}/${repo}/pulls?state=closed&base=${branch}`;
    let pullRequests = await this.fetchPaginatedData(url);

    return pullRequests;
  }

  async getCommits(owner: string, repo: string, pullNumber: number) {
    const url = `${this.platformUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/commits`;
    let commits = await this.fetchPaginatedData(url);

    return commits;
  }

  // Add other DORA metrics methods here
}
