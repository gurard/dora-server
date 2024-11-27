import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GithubService } from './services/github.service';
import { AzureDevOpsService } from './services/azuredevops.service';
import { DeploymentFrequencyController } from './controllers/deployment-frequency.controller';

@Module({
  imports: [HttpModule],
  controllers: [DeploymentFrequencyController],
  providers: [GithubService, AzureDevOpsService],
})
export class AppModule {}
