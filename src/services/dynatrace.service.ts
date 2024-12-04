import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { HttpService } from '@nestjs/axios';
import { /*Observable,*/ firstValueFrom } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class DynatraceService {
  private readonly dynatraceApiUrl = process.env.DORA_DYNATRACE_URL;
  private readonly apiToken = process.env.DORA_DYNATRACE_TOKEN;

  constructor(private readonly httpService: HttpService) {}

  async getClosedProblems(
    managementZone: string,
    from: Date,
    to: Date,
  ): Promise<any[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.dynatraceApiUrl}api/v2/problems`, {
        headers: {
          Authorization: `Api-Token ${this.apiToken}`,
        },
        params: {
          from: moment(from).toISOString(),
          to: moment(to).toISOString(),
          problemSelector: `status("CLOSED"),managementZones("${managementZone}")`,
        },
      }),
    );
    return response.data.problems || [];
  }
}
