import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GithubService {
  private readonly githubApiUrl = 'https://api.github.com';
  private readonly personalAccessToken = '';

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `token ${this.personalAccessToken}`,
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

  async getDeploymentFrequency(
    owner: string,
    repo: string,
    env: string,
  ): Promise<any[]> {
    const url = `${this.githubApiUrl}/repos/${owner}/${repo}/deployments?environment=${env}`;
    console.log('url', url);

    return await this.fetchPaginatedData(url);
  }

  // Add other DORA metrics methods here
}
