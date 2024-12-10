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

  async getDeploymentInfo(
    namespace: string,
    deploymentName: string,
  ): Promise<any> {
    const deploymentUrl = `${this.platformUrl}/apis/apps/v1/namespaces/${namespace}/deployments/${deploymentName}`;
    const podsUrl = `${this.platformUrl}/api/v1/namespaces/${namespace}/pods`;

    try {
      // Fetch deployment details
      const deploymentResponse = await firstValueFrom(
        this.httpService.get(deploymentUrl, { headers: this.getHeaders() }),
      );
      const deployment = deploymentResponse.data;

      // Extract the full image string from the deployment's container spec
      const fullImage = deployment.spec.template.spec.containers[0].image;

      // Extract the Docker tag from the image string
      const imageTag = this.extractDockerTag(fullImage);

      // Extract the "app" label from the deployment's selector
      const appLabel = deployment.spec.selector.matchLabels['app'];
      if (!appLabel) {
        throw new HttpException(
          `Deployment does not have an "app" label in its selector`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Fetch pods with the "app" label matching the deployment's "app" label
      const podsResponse = await firstValueFrom(
        this.httpService.get(`${podsUrl}?labelSelector=app=${appLabel}`, {
          headers: this.getHeaders(),
        }),
      );
      const pods = podsResponse.data.items;

      // Map the pods to their names and statuses
      const relatedPods = pods.map((pod) => ({
        name: pod.metadata.name,
        status: pod.status.phase,
      }));

      return {
        imageTag,
        pods: relatedPods,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch deployment information',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private extractDockerTag(fullImage: string): string {
    let tag = '';

    const parts = fullImage.split(':');
    if (parts.length > 1) {
      return parts[1];
    }

    return tag;
  }
}
