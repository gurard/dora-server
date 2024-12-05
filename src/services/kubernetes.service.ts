import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class KubernetesService {
  private readonly platformUrl = process.env.DORA_K8S_URL;
  private readonly token = process.env.DORA_K8S_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  getServiceLabels(namespace: string, service: string) {
    return 'hello world';
  }
}
