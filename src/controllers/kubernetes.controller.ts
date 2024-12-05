import { Controller, Get, Query } from '@nestjs/common';
import { KubernetesService } from '../services/kubernetes.service';

@Controller('kubernetes')
export class KubernetesController {
  constructor(private readonly kubernetesService: KubernetesService) {}

  @Get('service-labels')
  async getDeploymentsGithub(
    @Query('namespace') namespace: string,
    @Query('service') service: string,
  ) {
    return this.kubernetesService.getServiceLabels(namespace, service);
  }

  // Add other DORA metric routes here
}
