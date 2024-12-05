import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './services/github.service';
import { AzureDevOpsService } from './services/azuredevops.service';
import { DynatraceService } from './services/dynatrace.service';
import { AzureDevOpsController } from './controllers/azuredevops.controller';
import { GithubController } from './controllers/github.controller';
import { DynatraceController } from './controllers/dynatrace.controller';

@Module({
  imports: [HttpModule],
  controllers: [GithubController, AzureDevOpsController, DynatraceController],
  providers: [GithubService, AzureDevOpsService, DynatraceService],
})
export class AppModule {}
