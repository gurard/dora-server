import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  differenceInWeeks,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

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

      // Map the pods to their names, statuses, and ages
      const relatedPods = pods.map((pod) => {
        const creationTimestamp = new Date(pod.metadata.creationTimestamp);
        const age = this.calculateFormattedAge(creationTimestamp);

        return {
          name: pod.metadata.name,
          status: pod.status.phase,
          age: age,
        };
      });

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

  private calculateFormattedAge(creationDate: Date): string {
    const now = new Date();

    const weeks = differenceInWeeks(now, creationDate);
    const days = differenceInDays(now, creationDate) % 7;
    const hours = differenceInHours(now, creationDate) % 24;
    const minutes = differenceInMinutes(now, creationDate) % 60;

    let ageParts = [];
    if (weeks > 0) {
      ageParts.push(`${weeks}w`);
    }
    if (days > 0) {
      ageParts.push(`${days}d`);
    }
    if (hours > 0) {
      ageParts.push(`${hours}h`);
    }
    if (minutes > 0) {
      ageParts.push(`${minutes}m`);
    }

    // If the pod is less than a minute old
    if (ageParts.length === 0) {
      ageParts.push('0m');
    }

    return ageParts.join('');
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
