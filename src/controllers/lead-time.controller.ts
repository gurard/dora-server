import { Controller, Get, Query } from '@nestjs/common';
import * as moment from 'moment';
import { GithubService } from '../services/github.service';
import { IDeployment } from '../models/deployment.interface';

@Controller('lead-time')
export class LeadTimeController {
  constructor(private readonly githubService: GithubService) {}

  @Get('github')
  getLeadTime(@Query('owner') owner: string, @Query('repo') repo: string) {
    return this.githubService.getLeadTime(owner, repo);
  }
}
