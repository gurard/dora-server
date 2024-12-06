import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './services/github.service';
import { AzureDevOpsService } from './services/azuredevops.service';
import { DynatraceService } from './services/dynatrace.service';
import { KubernetesService } from './services/kubernetes.service';
import { AzureDevOpsController } from './controllers/azuredevops.controller';
import { GithubController } from './controllers/github.controller';
import { DynatraceController } from './controllers/dynatrace.controller';
import { KubernetesController } from './controllers/kubernetes.controller';

@Module({
  imports: [HttpModule],
  controllers: [
    GithubController,
    AzureDevOpsController,
    DynatraceController,
    KubernetesController,
  ],
  providers: [
    GithubService,
    AzureDevOpsService,
    DynatraceService,
    KubernetesService,
  ],
})
export class AppModule {}
