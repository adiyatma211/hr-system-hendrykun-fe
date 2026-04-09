import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgpDialogTrigger } from 'ng-primitives/dialog';
import { Badge } from 'flowbite-angular/badge';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from 'flowbite-angular/modal';
import { APP_SHELL } from '../../../../core/constants/app-shell.constants';
import {
  DashboardStat,
  EmployeeRecord,
  QuickAction,
  DashboardStatsPayload,
  EmployeeListItem,
} from '../../../../core/models/dashboard.model';
import { DashboardApiService } from '../../../../core/services/dashboard-api.service';
import { AppIconComponent } from '../../../../shared/ui/app-icon/app-icon.component';
import { RecentEmployeesTableComponent } from '../../components/recent-employees-table/recent-employees-table.component';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    NgpDialogTrigger,
    Badge,
    Modal,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    AppIconComponent,
    StatCardComponent,
    RecentEmployeesTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="grid gap-6">
      <div class="surface-card relative overflow-hidden px-6 py-7 sm:px-8">
        <div class="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_right,_rgba(31,111,178,0.16),_transparent_46%)]"></div>
        <div class="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <span flowbiteBadge color="primary" pill class="!rounded-full !px-3 !py-1.5">Live overview</span>
              <span
                flowbiteBadge
                [color]="loadError() ? 'warning' : 'success'"
                pill
                class="!rounded-full !px-3 !py-1.5"
              >
                {{ isLoading() ? 'Syncing backend' : loadError() ? 'Connection issue' : 'Backend connected' }}
              </span>
            </div>
            <div>
              <h2 class="text-3xl font-bold text-ui-text">Welcome back to {{ brandName }}</h2>
              <p class="mt-3 max-w-3xl muted-copy">
                This dashboard now reads live summary data from the CoreHR backend while keeping the same admin shell and reusable UI components.
              </p>
            </div>
          </div>

          <div class="surface-card max-w-sm px-5 py-4">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-ui-muted">Backend target</p>
            <p class="mt-2 text-base font-semibold text-ui-text">
              Dashboard stats and employee list now come from the live CoreHR API.
            </p>
          </div>
        </div>
      </div>

      @if (loadError()) {
        <div class="rounded-[28px] border border-warning/20 bg-warning/5 px-5 py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-semibold text-ui-text">Backend sync failed</p>
              <p class="mt-1 text-sm text-ui-muted">{{ loadError() }}</p>
            </div>
            <button type="button" class="btn-secondary" (click)="loadDashboard()">Retry</button>
          </div>
        </div>
      }

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        @for (stat of stats(); track stat.label) {
          <app-stat-card [stat]="stat" />
        }
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div class="grid gap-4">
          @if (employeeListWarning()) {
            <div class="rounded-[28px] border border-warning/20 bg-warning/5 px-5 py-4">
              <p class="text-sm font-semibold text-ui-text">Employee list unavailable</p>
              <p class="mt-1 text-sm text-ui-muted">{{ employeeListWarning() }}</p>
            </div>
          }

          <app-recent-employees-table [employees]="employees()" />
        </div>

        <aside class="surface-card p-6">
          <div class="mb-6">
            <h2 class="text-xl font-bold text-ui-text">Quick actions</h2>
            <p class="mt-1 muted-copy">Small shortcuts while the admin dashboard starts using live CoreHR data.</p>
          </div>

          <div class="space-y-3">
            @for (action of quickActions; track action.title) {
              @if (action.kind === 'modal') {
                <button
                  type="button"
                  class="group flex w-full items-start gap-4 rounded-[24px] border border-ui-border bg-ui-surface px-4 py-4 text-left transition hover:border-brand-blue/25 hover:bg-brand-blue/5"
                  [ngpDialogTrigger]="announcementDialog"
                >
                  <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue/12 text-brand-blue">
                    <app-icon [name]="action.icon" iconClass="h-5 w-5" />
                  </span>
                  <span class="flex-1">
                    <span class="block font-semibold text-ui-text">{{ action.title }}</span>
                    <span class="mt-1 block text-sm text-ui-muted">{{ action.description }}</span>
                  </span>
                </button>
              } @else {
                <button
                  type="button"
                  class="group flex w-full items-start gap-4 rounded-[24px] border border-ui-border bg-ui-surface px-4 py-4 text-left transition hover:border-brand-blue/25 hover:bg-brand-blue/5"
                >
                  <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-green/12 text-brand-green">
                    <app-icon [name]="action.icon" iconClass="h-5 w-5" />
                  </span>
                  <span class="flex-1">
                    <span class="block font-semibold text-ui-text">{{ action.title }}</span>
                    <span class="mt-1 block text-sm text-ui-muted">{{ action.description }}</span>
                  </span>
                </button>
              }
            }
          </div>

          <ng-template #announcementDialog let-close="close">
            <div flowbiteModalOverlay position="center">
              <section flowbiteModal size="lg" class="!border !border-ui-border !bg-ui-surface">
                <h3 flowbiteModalHeader class="!border-ui-border !text-ui-text">Create internal announcement</h3>
                <div flowbiteModalContent class="!space-y-5">
                  <p class="muted-copy">
                    This is a dummy modal to confirm Flowbite Angular is configured and ready for interactive UI patterns.
                  </p>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="rounded-3xl border border-ui-border bg-ui-bg p-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Draft target</p>
                      <p class="mt-2 text-lg font-semibold text-ui-text">All employees</p>
                    </div>
                    <div class="rounded-3xl border border-ui-border bg-ui-bg p-4">
                      <p class="text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">Delivery channel</p>
                      <p class="mt-2 text-lg font-semibold text-ui-text">Portal banner</p>
                    </div>
                  </div>

                  <div class="rounded-3xl border border-brand-gold/20 bg-brand-gold/8 p-4">
                    <p class="text-sm font-semibold text-ui-text">Backend note</p>
                    <p class="mt-2 text-sm leading-6 text-ui-muted">
                      Later this modal can be connected to a real create-announcement API or a global notification workflow.
                    </p>
                  </div>
                </div>
                <div flowbiteModalFooter class="!justify-end !border-ui-border">
                  <button type="button" class="btn-secondary" (click)="close()">Cancel</button>
                  <button type="button" class="btn-primary" (click)="close()">Save draft</button>
                </div>
              </section>
            </div>
          </ng-template>
        </aside>
      </div>
    </section>
  `,
})
export class DashboardHomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  protected readonly brandName = APP_SHELL.brandName;
  protected readonly isLoading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly employeeListWarning = signal<string | null>(null);

  protected readonly stats = signal<DashboardStat[]>(this.buildLoadingStats());

  protected readonly employees = signal<EmployeeRecord[]>([]);

  protected readonly quickActions: QuickAction[] = [
    {
      title: 'Create announcement',
      description: 'Open a branded modal pattern for future internal comms.',
      actionLabel: 'Open modal',
      icon: 'announcement',
      kind: 'modal',
    },
    {
      title: 'Invite employee',
      description: 'Placeholder action for employee onboarding and account creation.',
      actionLabel: 'Prepare flow',
      icon: 'upload',
      kind: 'ghost',
    },
    {
      title: 'Prepare policy brief',
      description: 'Starter card for upcoming HR compliance and handbook updates.',
      actionLabel: 'View draft',
      icon: 'briefcase',
      kind: 'ghost',
    },
  ];

  constructor() {
    this.loadDashboard();
  }

  protected loadDashboard(): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.employeeListWarning.set(null);

    forkJoin({
      stats: this.dashboardApi.getStats(),
      employees: this.dashboardApi.getRecentEmployees().pipe(
        catchError((error: unknown) => {
          this.employeeListWarning.set(this.getErrorMessage(error));
          return of([]);
        }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, employees }) => {
          this.stats.set(this.mapStats(stats));
          this.employees.set(employees.map((employee) => this.mapEmployee(employee)));
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.stats.set(this.buildLoadingStats('Unavailable'));
          this.employees.set([]);
          this.loadError.set(this.getErrorMessage(error));
          this.isLoading.set(false);
        },
      });
  }

  private buildLoadingStats(value = '...'): DashboardStat[] {
    return [
      { label: 'Total Employees', value, delta: 'Waiting for backend sync', accent: 'blue', icon: 'employees' },
      { label: 'Present Today', value, delta: 'Attendance summary will appear here', accent: 'green', icon: 'attendance' },
      { label: 'Pending Leaves', value, delta: 'Leave request review count will appear here', accent: 'gold', icon: 'leave' },
      { label: 'Departments', value, delta: 'Department and position totals will appear here', accent: 'info', icon: 'briefcase' },
    ];
  }

  private mapStats(stats: DashboardStatsPayload): DashboardStat[] {
    return [
      {
        label: 'Total Employees',
        value: String(stats.totalEmployees),
        delta: `${stats.activeEmployees} active employees`,
        accent: 'blue',
        icon: 'employees',
      },
      {
        label: 'Present Today',
        value: String(stats.totalAttendancesToday),
        delta: `${stats.totalApprovedLeaves} approved leaves`,
        accent: 'green',
        icon: 'attendance',
      },
      {
        label: 'Pending Leaves',
        value: String(stats.totalPendingLeaves),
        delta: `${stats.totalRejectedLeaves} rejected requests`,
        accent: 'gold',
        icon: 'leave',
      },
      {
        label: 'Departments',
        value: String(stats.totalDepartments),
        delta: `${stats.totalPositions} tracked positions`,
        accent: 'info',
        icon: 'briefcase',
      },
    ];
  }

  private mapEmployee(employee: EmployeeListItem): EmployeeRecord {
    return {
      id: employee.id,
      name: employee.fullName,
      role: employee.positionName ?? this.formatRole(employee.role),
      department: employee.departmentName ?? 'Unassigned',
      location: employee.address ?? 'Not provided',
      status: employee.isActive ? 'Active' : 'Inactive',
      startDate: this.formatDate(employee.hireDate),
    };
  }

  private formatDate(value: string | null): string {
    if (!value) {
      return 'Not set';
    }

    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? value : this.dateFormatter.format(parsedDate);
  }

  private formatRole(role: EmployeeListItem['role']): string {
    return role === 'admin_hr' ? 'HR Administrator' : 'Employee';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;

      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }

    return 'Backend belum merespons atau konfigurasi API belum sesuai.';
  }
}
