import { Controller, Get, Query } from '@nestjs/common';
import { KubernetesService } from '../services/kubernetes.service';

@Controller('kubernetes')
export class KubernetesController {
  constructor(private readonly kubernetesService: KubernetesService) {}

  // Existing endpoint
  @Get('blue-green')
  async getServiceBlueGreen(
    @Query('namespace') namespace: string,
    @Query('service') service: string,
    @Query('blueLabel') blueLabel: string,
    @Query('greenLabel') greenLabel: string,
  ) {
    let response = { service: service, blue: false, green: false };

    try {
      const labels = await this.kubernetesService.getServiceLabels(
        namespace,
        service,
      );

      const appLabel = labels['app'];

      if (appLabel) {
        response.blue = appLabel === blueLabel;
        response.green = appLabel === greenLabel;
      }

      return response;
    } catch (error) {
      return error;
    }
  }

  // New endpoint
  @Get('deployment-info')
  async getDeploymentInfo(
    @Query('namespace') namespace: string,
    @Query('deployment') deployment: string,
  ) {
    try {
      const deploymentInfo = await this.kubernetesService.getDeploymentInfo(
        namespace,
        deployment,
      );
      return deploymentInfo;
    } catch (error) {
      return error;
    }
  }
}
