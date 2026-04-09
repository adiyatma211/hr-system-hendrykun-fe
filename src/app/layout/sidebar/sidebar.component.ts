import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfile } from '../../core/models/auth.model';
import { NavigationItem } from '../../core/models/navigation.model';
import { AppIconComponent } from '../../shared/ui/app-icon/app-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="sidebar-shell sidebar-scroll flex h-full flex-col overflow-y-auto px-5 py-6 sm:px-6 xl:px-7">
      <div class="mb-8 flex items-center gap-3 px-1">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-[0_18px_30px_-18px_rgba(31,111,178,0.8)]">
          <span class="text-lg font-extrabold">C</span>
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Enterprise CMS</p>
          <h1 class="text-xl font-bold text-white">CoreHR</h1>
        </div>
      </div>

      <div class="surface-card mb-8 border-slate-800/70 bg-white/6 p-4 text-slate-100 shadow-none">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
        <p class="mt-3 text-lg font-semibold text-white">{{ user()?.name ?? 'CoreHR Admin' }}</p>
        <p class="mt-1 text-sm text-slate-400">{{ user()?.role ?? 'Administrator' }}</p>
      </div>

      <nav class="flex-1 space-y-2.5">
        @for (item of items(); track item.route) {
          @if (item.disabled) {
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium text-slate-400 transition hover:bg-white/5"
            >
              <span class="inline-flex items-center gap-3">
                <app-icon [name]="item.icon" iconClass="h-5 w-5" />
                {{ item.label }}
              </span>
              <span class="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                Soon
              </span>
            </button>
          } @else {
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-white/12 text-white shadow-[0_18px_40px_-28px_rgba(255,255,255,0.65)]"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-300 transition hover:bg-white/8 hover:text-white"
              (click)="navigate.emit()"
            >
              <app-icon [name]="item.icon" iconClass="h-5 w-5" />
              {{ item.label }}
            </a>
          }
        }
      </nav>

      <button
        type="button"
        class="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5 text-sm font-semibold text-white transition hover:border-danger/30 hover:bg-danger/12"
        (click)="signOut.emit()"
      >
        <app-icon name="logout" iconClass="h-5 w-5" />
        Logout
      </button>

      <div class="mt-8 rounded-3xl border border-brand-gold/20 bg-brand-gold/10 p-4 xl:p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">Foundation phase</p>
        <p class="mt-3 text-sm leading-6 text-slate-200">
          Layout, navigation state, and mock widgets are ready to be connected to real APIs next.
        </p>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly items = input.required<NavigationItem[]>();
  readonly user = input<UserProfile | null>(null);

  readonly navigate = output<void>();
  readonly signOut = output<void>();
}
