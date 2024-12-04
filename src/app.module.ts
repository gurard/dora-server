import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './services/github.service';
import { AzureDevOpsService } from './services/azuredevops.service';
import { DynatraceService } from './services/dynatrace.service';
import { LeadTimeController } from './controllers/lead-time.controller';
import { DeploymentFrequencyController } from './controllers/deployment-frequency.controller';
import { MttrController } from './controllers/mttr.controller';

@Module({
  imports: [HttpModule],
  controllers: [
    DeploymentFrequencyController,
    MttrController,
    LeadTimeController,
  ],
  providers: [GithubService, AzureDevOpsService, DynatraceService],
})
export class AppModule {}
