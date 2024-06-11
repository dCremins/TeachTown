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
  ];
  public launches: MatTableDataSource<Launch> = new MatTableDataSource();

  public resultsLength = 0;
  public isLoadingResults = true;
  private paginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );
  private sort: MatSort = new MatSort();

  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator;
    this.launches.paginator = paginator;
  }
  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.sort = sort;
    this.launches.sort = sort;
  }

  constructor(private launchService: LaunchService) {}

  ngAfterViewInit() {
    this.getLaunches();
  }

  getLaunches(): void {
    this.isLoadingResults = true;
    this.launchService
      .getLaunches(
        this.sort.active,
        this.sort.direction,
        this.paginator.pageIndex
      )
      .pipe(
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

  openPressKit(launch: Launch) {
    // Not all launches have presskit links
    // SpaceX Hosted Press Kit Links currently redirect to the main website
    // https://github.com/r-spacex/SpaceX-API/issues/810
    if (launch.links && launch.links.presskit) {
      window.open(launch.links.presskit, '_blank');
    }
  }
}
