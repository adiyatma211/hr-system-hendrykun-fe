import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { Badge } from 'flowbite-angular/badge';
import { Pagination } from 'flowbite-angular/pagination';
import { Table, TableBody, TableHead } from 'flowbite-angular/table';
import { EmployeeRecord } from '../../../../core/models/dashboard.model';

@Component({
  selector: 'app-recent-employees-table',
  standalone: true,
  imports: [Badge, Pagination, Table, TableHead, TableBody],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="surface-card overflow-hidden p-6">
      <div class="flex flex-col gap-4 border-b border-ui-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-ui-text">Recent employees</h2>
          <p class="mt-1 muted-copy">Starter dataset for onboarding, location, and current employee status.</p>
        </div>
        <span flowbiteBadge color="primary" pill class="!rounded-full !px-3 !py-1.5">
          {{ employees().length }} team members
        </span>
      </div>

      <div class="mt-4 overflow-x-auto">
        <table flowbiteTable color="default" class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr flowbiteTableHead class="bg-slate-50/80">
              <th class="rounded-l-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Employee
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Department
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Location
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Start date
              </th>
              <th class="rounded-r-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-ui-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            @for (employee of pagedEmployees(); track employee.id) {
              <tr flowbiteTableBody class="border-b border-ui-border/70 align-top">
                <td class="px-4 py-4">
                  <div>
                    <p class="font-semibold text-ui-text">{{ employee.name }}</p>
                    <p class="mt-1 text-sm text-ui-muted">{{ employee.role }}</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm text-ui-text">{{ employee.department }}</td>
                <td class="px-4 py-4 text-sm text-ui-text">{{ employee.location }}</td>
                <td class="px-4 py-4 text-sm text-ui-text">{{ employee.startDate }}</td>
                <td class="px-4 py-4">
                  <span
                    flowbiteBadge
                    pill
                    [color]="badgeColor(employee.status)"
                    class="!rounded-full !px-3 !py-1.5"
                  >
                    {{ employee.status }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex justify-end">
        <nav
          flowbitePagination
          color="primary"
          [page]="page()"
          [pageCount]="pageCount()"
          [tabs]="5"
          (pageChange)="onPageChange($event)"
        ></nav>
      </div>
    </section>
  `,
})
export class RecentEmployeesTableComponent {
  readonly employees = input.required<EmployeeRecord[]>();
  readonly pageSize = input(5);

  protected readonly page = signal(1);
  protected readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.employees().length / this.pageSize())),
  );
  protected readonly pagedEmployees = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.employees().slice(start, start + this.pageSize());
  });

  protected onPageChange(page: number): void {
    this.page.set(page);
  }

  protected badgeColor(status: EmployeeRecord['status']) {
    switch (status) {
      case 'Remote':
        return 'info' as const;
      case 'Inactive':
        return 'warning' as const;
      default:
        return 'success' as const;
    }
  }
}
