import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {Http} from "@angular/http";
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public data;
  public filterQuery = "";
  public rowsOnPage = 10;
  public sortBy = "email";
  public sortOrder = "asc";

  constructor(
		private authService: AuthService,
		private router: Router
	) { }

  ngOnInit() :void {
    this.authService.getAllCoins().subscribe(res => {
      
      let msg = res.msg;
      if(msg == 'success'){
        console.log(res.coins);
        this.data = res.coins;
      }
		},
		err => {
			console.log(err);
			return false;
		});
  }
  public toInt(num: string) {
    return +num;
  }

  public sortByWordLength = (a: any) => {
      return a.city.length;
  }
}
