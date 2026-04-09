import { Injectable, computed, signal } from '@angular/core';
import {
  AuthenticatedUser,
  AuthSessionSnapshot,
  UserProfile,
} from '../models/auth.model';
import { getInitials } from '../../shared/utils/string.utils';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly storageKey = 'corehr.admin.session';
  private readonly sessionState = signal<AuthSessionSnapshot | null>(this.restoreSession());

  readonly user = computed(() => {
    const authenticatedUser = this.sessionState()?.user;

    return authenticatedUser ? this.toUserProfile(authenticatedUser) : null;
  });
  readonly authenticatedUser = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  setSession(accessToken: string, user: AuthenticatedUser): void {
    const session: AuthSessionSnapshot = { accessToken, user };
    this.sessionState.set(session);
    this.persistSession(session);
  }

  signOut(): void {
    this.sessionState.set(null);
    this.clearSession();
  }

  updateUser(user: AuthenticatedUser): void {
    const currentSession = this.sessionState();

    if (!currentSession) {
      return;
    }

    this.setSession(currentSession.accessToken, user);
  }

  getAccessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  private restoreSession(): AuthSessionSnapshot | null {
    try {
      const rawSession = localStorage.getItem(this.storageKey);
      return rawSession ? (JSON.parse(rawSession) as AuthSessionSnapshot) : null;
    } catch {
      return null;
    }
  }

  private persistSession(session: AuthSessionSnapshot): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    } catch {
      // Ignore storage failures while persisting the session snapshot.
    }
  }

  private clearSession(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore storage failures while clearing the session snapshot.
    }
  }

  private toUserProfile(user: AuthenticatedUser): UserProfile {
    return {
      name: user.fullName,
      email: user.email,
      role: user.positionName ?? this.formatRole(user.role),
      initials: getInitials(user.fullName),
    };
  }

  private formatRole(role: AuthenticatedUser['role']): string {
    return role === 'admin_hr' ? 'HR Administrator' : 'Employee';
  }
}
