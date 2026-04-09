import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { AuthApiService } from './core/services/auth-api.service';
import { AuthSessionService } from './core/services/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly authApi = inject(AuthApiService);
  private readonly authSession = inject(AuthSessionService);

  constructor() {
    if (!this.authSession.getAccessToken()) {
      return;
    }

    this.authApi
      .me()
      .pipe(
        catchError(() => {
          this.authSession.signOut();
          return EMPTY;
        }),
      )
      .subscribe((user) => this.authSession.updateUser(user));
  }
}
