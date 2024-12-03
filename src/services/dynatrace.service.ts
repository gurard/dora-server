import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as moment from 'moment';

@Injectable()
export class DynatraceService {
  private readonly dynatraceApiUrl = ''; // Replace with actual URL
  private readonly apiToken = ''; // Replace with your API token

  async getClosedProblems(
    managementZone: string,
    from: Date,
    to: Date,
  ): Promise<any[]> {
    const response = await axios.get(`${this.dynatraceApiUrl}api/v2/problems`, {
      headers: {
        Authorization: `Api-Token ${this.apiToken}`,
      },
      params: {
        from: moment(from).toISOString(),
        to: moment(to).toISOString(),
        problemSelector: `status("CLOSED"),managementZones("${managementZone}")`,
      },
    });
    return response.data.problems || [];
  }
}
