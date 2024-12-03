import { Controller, Get, Query } from '@nestjs/common';
import { DynatraceService } from '../services/dynatrace.service';
import * as moment from 'moment';

@Controller('mttr')
export class MttrController {
  constructor(private readonly dynatraceService: DynatraceService) {}

  @Get('dynatrace')
  async getMttr(@Query('managementZone') managementZone: string): Promise<any> {
    const currentDate = moment().toDate();
    const startDate = moment().subtract(10, 'weeks').startOf('week').toDate();

    const closedProblems = await this.dynatraceService.getClosedProblems(
      managementZone,
      startDate,
      currentDate,
    );

    // const results = this.calculateWeeklyMttr(closedProblems, weeks, now);

    return closedProblems;
  }

  //   private calculateWeeklyMttr(
  //     problems: any[],
  //     weeks: number,
  //     from: Date,
  //     to: Date,
  //   ): any[] {
  //     const results = [];

  //     for (let i = 0; i < weeks; i++) {
  //       const startOfWeek = new Date(now);
  //       startOfWeek.setDate(now.getDate() - now.getDay() - i * 7);
  //       const endOfWeek = new Date(startOfWeek);
  //       endOfWeek.setDate(startOfWeek.getDate() + 6);

  //       const weeklyProblems = problems.filter((problem) => {
  //         const closeTime = new Date(problem.endTime).getTime();
  //         return (
  //           closeTime >= startOfWeek.getTime() && closeTime <= endOfWeek.getTime()
  //         );
  //       });

  //       const mttr = this.calculateMttr(weeklyProblems);
  //       results.push({ week: i + 1, mttr });
  //     }

  //     return results;
  //   }

  //   private calculateMttr(problems: any[]): number {
  //     const totalRecoveryTime = problems.reduce((total, problem) => {
  //       const openTime = new Date(problem.startTime).getTime();
  //       const closeTime = new Date(problem.endTime).getTime();
  //       return total + (closeTime - openTime);
  //     }, 0);

  //     return problems.length
  //       ? totalRecoveryTime / problems.length / 1000 / 60 / 60
  //       : 0; // Convert ms to hours
  //   }
}
