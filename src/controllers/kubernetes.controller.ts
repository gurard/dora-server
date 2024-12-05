import { Controller, Get, Query, Body } from '@nestjs/common';
import { KubernetesService } from '../services/kubernetes.service';
import { IService } from '../models/kubernetes.interface';

@Controller('kubernetes')
export class KubernetesController {
  constructor(private readonly kubernetesService: KubernetesService) {}

  @Get('blue-green')
  async getServiceBlueGreen(
    @Query('namespace') namespace: string,
    @Query('service') service: string,
    @Body('blueLabel') blueLabel: string,
    @Body('greenLabel') greenLabel: string,
  ) {
    let response: IService = { service: service, blue: false, green: false };

    let labels = await this.kubernetesService.getServiceLabels(
      namespace,
      service,
    );

    let appLabel = labels['app'];

    if (appLabel) {
      response.blue = appLabel === blueLabel;
      response.green = appLabel === greenLabel;
    }

    return response;
  }
}
