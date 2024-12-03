import { Controller, Get, Query } from '@nestjs/common';
import { DynatraceService } from '../services/dynatrace.service';
import * as moment from 'moment';

@Controller('mttr')
export class MttrController {
  constructor(private readonly dynatraceService: DynatraceService) {}

  @Get('dynatrace')
  async calculateMttr(@Query('managementZone') managementZone: string) {
    const mttrResults = [];
    const today = moment();

    for (let i = 0; i < 10; i++) {
      const weekStart = today.clone().subtract(i, 'weeks').startOf('week');
      const weekEnd = today.clone().subtract(i, 'weeks').endOf('week');

      try {
        const problems = await this.dynatraceService.getClosedProblems(
          managementZone,
          weekStart.toDate(),
          weekEnd.toDate(),
        );

        const closedProblems = problems || [];

        if (!Array.isArray(closedProblems) || closedProblems.length === 0) {
          mttrResults.push({
            week: weekStart.format('MM/DD'),
            mttr: 0,
          });
          continue;
        }

        const totalDowntime = closedProblems.reduce((acc, problem) => {
          const startTime = moment(problem.startTime);
          const endTime = moment(problem.endTime);
          return acc + endTime.diff(startTime, 'minutes');
        }, 0);

        const mttr = totalDowntime / closedProblems.length;
        mttrResults.push({ week: weekStart.format('MM/DD'), mttr });
      } catch (error) {
        console.error('Error fetching closed problems:', error);
      }
    }

    // Sort results by week in ascending order (oldest to newest)
    mttrResults.sort((a, b) => moment(a.week).diff(moment(b.week)));

    return mttrResults;
  }
}
