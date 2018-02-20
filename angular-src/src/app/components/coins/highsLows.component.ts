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
import {MatListModule} from '@angular/material/list';
//import { HttpHeaders } from '@angular/common/http/src/headers';
import { Observable, Subscription } from 'rxjs/Rx';
import { serverUrl } from 'app/config/globals';
@Component({
  selector: 'app-dashboard',
  templateUrl: './highsLows.component.html',
  styleUrls: ['./highsLows.component.css']
})
export class highsLowsComponent implements OnInit {

  selectedHighs : string;
  selectedLows : string;
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private coinService: CoinService,
    private router: Router
  ) {}

  ngOnInit() {
    this.selectedHighs = '1M';
    this.selectedLows = '1M';
  }
}
