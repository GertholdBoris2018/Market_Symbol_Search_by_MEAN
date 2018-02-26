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
@Component({
  selector: 'app-dashboard',
  templateUrl: './coinlist.component.html',
  styleUrls: ['./coin.component.css']
})
export class CoinListComponent implements OnInit {

  displayedColumns = [
    '#', 'name', 'market_cap',
    'price','volume24h','supplies','change1h',
    'change24h','change7d','change1M','change6M'];
  exampleDatabase: ExampleHttpDao | null;
  dataSource = new MatTableDataSource();
  resultsLength = 0;
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

  typesOfShoes = [];


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
    this.selectedprice = "_";
    this.selectedmarket = "_";
    this.selectedvolumn = "_";
    this.selectedcirculate = "_";
    this.selectedage = "_";
    this.selectedtype = "";
    this.selectedPerfomance = "";
    this.selectedOrder = "cap:descending";
    this.currentTime = Date.now();
    this.sendage = this.selectedage;
    this.typesOfShoes = ['Boots', 'Clogs', 'Loafers', 'Moccasins', 'Sneakers'];
    
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0,this.paginator.pageSize = 100
    });
    this.timer = Observable.timer(10000,20000);
    
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          var aStr = this.selectedage.split("_");
          if(aStr[0] != "")
          {
            this.sendage = (this.currentTime - parseInt(aStr[0])) + "_";
            console.log(this.sendage);
          
          }
          else if(aStr[1] != "")
          {

            this.sendage = "_" + (this.currentTime - parseInt(aStr[1]));
            //console.log(this.sendage);
           
          }
          else{
            this.sendage = "_";
          }
            let pageSize = (!this.paginator.pageSize)? 100 : this.paginator.pageSize;
            return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex,pageSize, this.selectedprice, this.selectedmarket, this.selectedvolumn,
             this.selectedcirculate, this.sendage, this.selectedtype, this.selectedPerfomance, this.selectedOrder);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.total_count;
          let items = [];
          data.items.forEach(function(item){
            let tItem = {};
            tItem['coinName'] = item['coinName'].toString();
            tItem['name'] = item['name'].toString();
            tItem['symbol'] = item['symbol'].toString();
            tItem['rank'] = item['rank'].toString();
            tItem['usd'] = numberWithCommas(item['usd']);
            tItem['btc'] = item['btc'].toString();
            tItem['vlm'] = numberWithCommas(item['vlm'].toString());
            tItem['cap'] = numberWithCommas(item['cap']);
            tItem['p_1h'] = item['p_1h'].toString();
            tItem['p_7d'] = item['p_7d'].toString();
            tItem['p_24h'] = item['p_24h'].toString();
            tItem['p_1M'] = item['p_1M'].toString();
            tItem['p_6M'] = item['p_6M'].toString();
            tItem['since_ts'] = item['since_ts'].toString();
            tItem['52w_l'] = item['52w_l'].toString();
            tItem['52w_h'] = item['52w_h'].toString();
            tItem['token'] = item['token'].toString();
            tItem['suppies'] = numberWithCommas(item['suppies']);

            items.push(tItem);
          });
          return items;
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
  }
  ngOnDestroy(){
    this.sub.unsubscribe();
  }
  tickerFunc(tick){
      console.log(this);
      this.ticks = tick;
      this.paginator._changePageSize(this.paginator.pageSize);
  }

  onChange(event)
  {
    this.paginator.pageIndex = 0;
    this.paginator._changePageSize(this.paginator.pageSize); 
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
  'coinName': string;
  'name': string;
  'symbol': string;
  'rank' : number;
  'usd': number;
  'btc': number;
  'vlm': number;
  'cap' : number;
  'since_ts': number;
  'p_1h' : number;
  'p_24h' : number;
  'p_7d' : number;
  'token' : number;
  '52w_l' : number;
  '52w_h' : number;
  'p_1M' : number;
  'p_6M' : number;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDao {
  constructor(private http: HttpClient ) {}

  getRepoIssues(sort: string, order: string, page: number, pagecount: number, priceFilter: string, marketFilter: string, volumnFilter: string, circulFilter : string,
               ageFilter : string, typeFilter : string, ppFilter: string, oFilter : string): Observable<CoinTickersAPI> {

    // const href = 'https://api.github.com/search/issues';
    // const requestUrl =
    //     `${href}?q=repo:angular/material2&sort=${sort}&order=${order}&page=${page + 1}`;

    // return this.http.get<GithubApi>(requestUrl);

    
    let token =  localStorage.getItem('id_token');
    //send token with header
    const headers = new HttpHeaders().set('Authorization', token);
    const href = serverUrl + 'coins/getAllTickers';
    const requestUrl = `${href}?sort=${sort}&order=${order}&page=${page + 1}&pageCount=${pagecount}&pFilter=${priceFilter}&mFilter=${marketFilter}&vFilter=${volumnFilter}&cFilter=${circulFilter}&aFilter=${ageFilter}&tFilter=${typeFilter}&ppFilter=${ppFilter}&oFilter=${oFilter}`;
    //return this.http.get<CoinTickersAPI>(requestUrl,{ headers }); It does not allowed unauthorize token
    return this.http.get<CoinTickersAPI>(requestUrl);
  }
}

