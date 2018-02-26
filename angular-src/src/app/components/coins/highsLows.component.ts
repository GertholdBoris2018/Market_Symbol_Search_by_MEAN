import { AuthService } from '../../services/auth.service';
import { CoinService } from '../../services/coin.service';
import { Router } from '@angular/router';
import {Http, Headers} from "@angular/http";

import {Component, OnInit,AfterViewInit, ViewChild, OnDestroy} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
import {MatListModule} from '@angular/material/list';
//import { HttpHeaders } from '@angular/common/http/src/headers';
import { Observable, Subscription } from 'rxjs/Rx';
import { serverUrl } from 'app/config/globals';
import { Paginator } from 'angular2-datatable/lib/Paginator';
@Component({
  selector: 'app-dashboard',
  templateUrl: './highsLows.component.html',
  styleUrls: ['./highsLows.component.css']
})
export class highsLowsComponent implements OnInit {

  displayedColumns = [
     'name'];
  exampleDatabase: ExampleHttpDao | null;
  exampleDatabase_Low : ExampleHttpDao_Low | null;

  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();

  resultsLength = 0;
  resultsLength1 = 0;
  isLoadingResults = false;
  isRateLimitReached = false;
  ticks = 0;
  private timer;
  private sub: Subscription;


  selectedprice: string;
  selectedmarket : string;
  selectedvolumn : string;
  selectedcirculate : string;
  selectedage : string;
  selectedtype : string;
  selectedPerfomance : string;
  selectedOrder : string;
  currentTime : number;
  sendage : string;
  selectedHighs : string;
  selectedLows : string;
  typesOfShoes = [];


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('hBSort') hBSort: MatSort;
  @ViewChild('hBpaginator') hBpaginator: MatPaginator;

  @ViewChild('lBSort') lBSort: MatSort;
  @ViewChild('lBpaginator') lBpaginator: MatPaginator;


  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedHighs = '1';
    this.selectedLows = '1';
    this.hBSort = this.sort;
    //this.hBpaginator = this.paginator;
    this.lBSort = this.sort;
    //this.lBpaginator = this.paginator;

    
    this.exampleDatabase = new ExampleHttpDao(this.http);
    this.exampleDatabase_Low = new ExampleHttpDao_Low(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.hBSort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0,this.paginator.pageSize = 100
    });
    this.timer = Observable.timer(10000,20000);
    
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
    merge(this.hBSort.sortChange, this.hBpaginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
            this.isLoadingResults = true;

            let pageSize = (!this.hBpaginator.pageSize)? 100 : this.hBpaginator.pageSize;
            return this.exampleDatabase!.getRepoIssues(this.hBSort.active, this.hBSort.direction, this.hBpaginator.pageIndex,pageSize, this.selectedHighs);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.total_count;
          //this.hBpaginator.length = data.total_count;
          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => 
        {
          this.dataSource.data = data;
        }
        
      );
      merge(this.lBSort.sortChange, this.lBpaginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
            this.isLoadingResults = true;

            let pageSize = (!this.lBpaginator.pageSize)? 100 : this.lBpaginator.pageSize;
            return this.exampleDatabase_Low!.getRepoIssues_lows(this.lBSort.active, this.lBSort.direction, this.lBpaginator.pageIndex,pageSize, this.selectedLows);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          //this.lBpaginator.length = data.total_count;
          this.resultsLength1 = data.total_count;
          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          return observableOf([]);
        })
      ).subscribe(data => 
        {
          this.dataSource1.data = data;
        }
        
      );
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  tickerFunc(tick){
      console.log(this);
      this.ticks = tick;
      this.hBpaginator._changePageSize(this.hBpaginator.pageSize);
      this.lBpaginator._changePageSize(this.lBpaginator.pageSize);
  }

  onChange(event)
  {
    this.hBpaginator.pageIndex = 0;
    this.hBpaginator._changePageSize(this.hBpaginator.pageSize); 
  }

  onChange_Low(event)
  {
    this.lBpaginator.pageIndex = 0;
    this.lBpaginator._changePageSize(this.lBpaginator.pageSize); 
  }
}
const numberWithCommas = (x) => {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
export interface CoinTickersAPI {
  items: CoinTicker[];
  total_count: number;
}

export interface CoinTicker {
  'coinName': string
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient ) {}

  getRepoIssues(sort: string, order: string, page: number, pagecount: number, selectedHighs : string): Observable<CoinTickersAPI> {
    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getHighs';
    const requestUrl = `${href}?page=${page + 1}&pageCount=${pagecount}&selectedHighs=${selectedHighs}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}

export class ExampleHttpDao_Low {
  constructor(private http: HttpClient ) {}

  getRepoIssues_lows(sort: string, order: string, page: number, pagecount: number, selectedLows : string): Observable<CoinTickersAPI> {
    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getLows';
    const requestUrl = `${href}?page=${page + 1}&pageCount=${pagecount}&selectedLows=${selectedLows}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}
