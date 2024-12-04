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

  getLeadTime(owner: string, repo: string) {
    return ['hello', 'world'];
  }

  // Add other DORA metrics methods here
}
