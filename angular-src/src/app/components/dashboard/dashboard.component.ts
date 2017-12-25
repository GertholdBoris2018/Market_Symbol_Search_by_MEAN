import { AuthService } from '../../services/auth.service';
import { CoinService } from '../../services/coin.service';
import { Router } from '@angular/router';
import {Http, Headers} from "@angular/http";

import {Component, OnInit,AfterViewInit, ViewChild} from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {catchError} from 'rxjs/operators/catchError';
import {map} from 'rxjs/operators/map';
import {startWith} from 'rxjs/operators/startWith';
import {switchMap} from 'rxjs/operators/switchMap';
//import { HttpHeaders } from '@angular/common/http/src/headers';
import { Observable, Subscription } from 'rxjs/Rx';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // public data;
  // public filterQuery = "";
  // public rowsOnPage = 10;
  // public sortBy = "email";
  // public sortOrder = "asc";

  // constructor(
  //   private authService: AuthService,
  //   private coinService: CoinService,
	// 	private router: Router
	// ) { }

  // ngOnInit() :void {
  //   this.coinService.getAllCoinTickers().subscribe(res => {
      
  //     let msg = res.msg;
  //     if(msg == 'success'){
  //       console.log(res.coins);
  //       this.data = res.coins;
  //     }
	// 	},
	// 	err => {
	// 		console.log(err);
	// 		return false;
	// 	});
  // }
  displayedColumns = ['#', 'name', 'market_cap', 'price','volumn24h','supplies','change1h','change24h','change7d'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource = new MatTableDataSource();

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;
  ticks = 0;
  private timer;
  private sub: Subscription;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router
  ) {}

  ngOnInit() {
    this.exampleDatabase = new ExampleHttpDao(this.http);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.timer = Observable.timer(2000,5000);
    
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
    
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource.data = data);
  }

  tickerFunc(tick){
      console.log(this);
      this.ticks = tick;
      this.paginator._changePageSize(this.paginator.pageSize); 
  }
}

export interface CoinTickersAPI {
  items: CoinTicker[];
  total_count: number;
}

export interface CoinTicker {
  'coinName': string;
  'name': string;
  'symbol': string;
  'rank' : number;
  'price_usd': number;
  'price_btc': number;
  '24h_volume_usd': number;
  'market_cap_usd' : number;
  'available_supply': number;
  'total_supply' : number;
  'max_supply' : number;
  'percent_change_1h' : number;
  'percent_change_24h' : number;
  'percent_change_7d' : number;
  'last_updated' : number;
  // created_at: string;
  // number: string;
  // state: string;
  // title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient ) {}

  getRepoIssues(sort: string, order: string, page: number): Observable<CoinTickersAPI> {

    // const href = 'https://api.github.com/search/issues';
    // const requestUrl =
    //     `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

    // return this.http.get<GithubApi>(requestUrl);

    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = 'http://204.12.62.182:4000/coins/getAllTickers';
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}`;
    return this.http.get<CoinTickersAPI>(requestUrl,{ headers });
  }
}
