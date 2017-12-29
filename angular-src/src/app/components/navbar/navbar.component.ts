import { Component, OnInit,trigger,	state,	style,	transition,	animate,	keyframes } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FlashMessagesService } from 'angular2-flash-messages';
//import { trigger, state, style, transition, animate } from '@angular/animations';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css'],
	animations: [
		trigger(
      'enterAnimation', [
        transition(':enter', [
          style({transform: 'translateX(100%)', opacity: 0}),
          animate('500ms', style({transform: 'translateX(0)', opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateX(0)', opacity: 1}),
          animate('500ms', style({transform: 'translateX(100%)', opacity: 0}))
        ])
      ]
    )
  ]
})
export class NavbarComponent implements OnInit {

  constructor(
		private authService: AuthService,
		private router: Router,
		private flashMessage:FlashMessagesService
	) { }

  ngOnInit() {
  }

	onLogoutClick(){
		this.authService.logout();
		this.flashMessage.show('Congrats! You are logged out', {
			cssClass:'alert-success',
			timeout: 3000
    });
    this.show = false;
		this.router.navigate(['/login']);
		return false;
  }
  closeTopBar(){
    this.show = false;
  }
  show:boolean = false;
  showLang:boolean = false;
}
