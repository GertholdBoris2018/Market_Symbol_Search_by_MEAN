import { Component, OnInit } from '@angular/core';
import { ValidateService } from '../../services/validate.service';
import { AuthService } from '../../services/auth.service';
import { FlashMessagesService } from 'angular2-flash-messages';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
	name: String;
	username: String;
	email: String;
	password: String;

  constructor(
		private validateService: ValidateService,
		private flashMessage: FlashMessagesService,
		private authService: AuthService,
		private router: Router
	) { }

  ngOnInit() {
  }

	//when the user submits a form, make sure everything is filled out and valid before accepting the input
	onRegisterSubmit(){
		const user = {
			name: this.name,
			email: this.email,
			username: this.username,
			password: this.password
		}

		//Required Fields
		if(!this.validateService.validateRegister(user)){
			this.flashMessage.show('Please fill in all the forms!', {cssClass: 'alert-danger', timeout: 3000});
			return false;
		}

		//Required Fields
		if(!this.validateService.validateEmail(user.email)){
			this.flashMessage.show('Why don\'t you try using a real email instead of an invalid email', {cssClass: 'alert-danger', timeout: 3000});
			return false;
		}

		//Register user
		this.authService.registerUser(user).subscribe(data => {
			if(data.success){
				//display success message
				this.flashMessage.show('You are now registered! Congratulations.', {cssClass: 'alert-success', timeout: 3000});

				//redirect
				this.router.navigate(['/login']);
			}
			else{
				//display failure message
				this.flashMessage.show('Whoops! Something went wrong! Whoops! Uh oh!', {cssClass: 'alert-danger', timeout: 3000});
				//redirect
				this.router.navigate(['/register']);
			}
		});

	}
}
