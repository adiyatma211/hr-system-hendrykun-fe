import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { ApiSuccessResponse } from '../models/api.model';
import {
  AuthenticatedUser,
  AuthSessionSnapshot,
  LoginCredentials,
} from '../models/auth.model';
import { AuthSessionService } from './auth-session.service';

interface LoginResponsePayload {
  accessToken: string;
  user: AuthenticatedUser;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly authSession = inject(AuthSessionService);

  login(credentials: LoginCredentials): Observable<AuthSessionSnapshot> {
    return this.http
      .post<ApiSuccessResponse<LoginResponsePayload>>(`${API_BASE_URL}/auth/login`, credentials)
      .pipe(
        map((response) => ({
          accessToken: response.data.accessToken,
          user: response.data.user,
        })),
        tap((session) => this.authSession.setSession(session.accessToken, session.user)),
      );
  }

  me(): Observable<AuthenticatedUser> {
    return this.http
      .get<ApiSuccessResponse<AuthenticatedUser>>(`${API_BASE_URL}/auth/me`)
      .pipe(map((response) => response.data));
  }
}
