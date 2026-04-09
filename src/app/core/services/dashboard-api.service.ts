import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { ApiSuccessResponse } from '../models/api.model';
import {
  DashboardStatsPayload,
  EmployeeListItem,
  PaginatedItems,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getStats(): Observable<DashboardStatsPayload> {
    return this.http
      .get<ApiSuccessResponse<DashboardStatsPayload>>(`${API_BASE_URL}/dashboard/stats`)
      .pipe(map((response) => response.data));
  }

  getRecentEmployees(limit = 6): Observable<EmployeeListItem[]> {
    const params = new HttpParams().set('page', 1).set('limit', limit);

    return this.http
      .get<ApiSuccessResponse<PaginatedItems<EmployeeListItem>>>(`${API_BASE_URL}/employees`, {
        params,
      })
      .pipe(map((response) => response.data.items));
  }
}
