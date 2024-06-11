import {
  Component,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, MatSortDefaultOptions } from '@angular/material/sort';
import { Launch } from '../launch/types';
import { LaunchService } from '../launch/launch.service';
import { map, merge, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements AfterViewInit {
  public title = 'SpaceX Launch Schedule';
  public displayedColumns: string[] = [
    'flight_number',
    'date_local',
    'name',
    'details',
    'links',
  ];
  public launches: MatTableDataSource<Launch> = new MatTableDataSource();

  public resultsLength = 0;
  public isLoadingResults = true;

  @ViewChild(MatPaginator) paginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  @ViewChild(MatSort) sort: MatSort = new MatSort();

  constructor(private launchService: LaunchService) {}

  ngAfterViewInit() {
    this.sort?.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.getLaunches();
    this.launches.sort = this.sort;
    this.launches.paginator = this.paginator;
  }

  getLaunches(): void {
    merge(this.sort?.sortChange, this.paginator?.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.launchService.getLaunches(
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex
          );
        }),
        map((data) => {
          this.isLoadingResults = false;

          if (data === null) {
            return [];
          }
          this.resultsLength = data.totalDocs;
          return data.docs;
        })
      )
      .subscribe(
        (launches) => (this.launches = new MatTableDataSource(launches))
      );
  }

  openLink(link?: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
