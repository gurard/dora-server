import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KubernetesService {
  private readonly platformUrl = process.env.DORA_K8S_URL;
  private readonly token = process.env.DORA_K8S_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getServiceLabels(namespace: string, service: string): Promise<any> {
    const url = `${this.platformUrl}/api/v1/namespaces/${namespace}/services/${service}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers: this.getHeaders() }),
      );

      // Extract labels from the service metadata
      const labels = response.data.metadata.labels;
      return labels;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch service labels',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
