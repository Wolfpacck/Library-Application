import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { UserService } from 'src/app/services/user.service';
import { User } from './User';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  currentUser = {};
  error = '';
  username = '';
  user = new User();
  message: string | undefined;
  //User update form parameters
  UserUpdateForm: FormGroup;
  showModal = false ;

  //Password update form parameters
  PasswordUpdateForm: FormGroup;
  constructor(private route: ActivatedRoute,
              private location: Location,
              private userService: UserService,
              private alert: AlertifyService,
              private router: Router,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.loadUserDetail();
    this.loadUserUpdateForm();
    this.loadPasswordUpdateForm();
  }

  loadUserDetail() {
    this.route.params.subscribe(params => {
      this.username = params['username'];
    });
    this.userService.getByName(this.username).subscribe(
      res => {
        this.user = res;
        this.loadUserUpdateForm();
      },
      error => {
        this.alert.error(' error: '+error + '<br/>.try again later');
        this.LoadBackPage();
      }
    );

  }

  loadUserUpdateForm(){
    this.UserUpdateForm = this.formBuilder.group({
      'username':     [this.user.username, [Validators.required]],
      'firstname':    [this.user.firstname, [Validators.required]],
      'lastname':     [this.user.lastname, [Validators.required]],
      'email':        [this.user.email, [Validators.required, Validators.email]],
    });
  }
  loadPasswordUpdateForm(){
    this.PasswordUpdateForm = this.formBuilder.group({
      'username':        [this.currentUser['username'], [Validators.required]],
      'password':        [null, [Validators.required]],
      'newpassword':    [null, [Validators.required]],
      'newpassword2':    [null, [Validators.required]],
    });
  }

  updateUser(){
    if (!this.UserUpdateForm.valid) {
      return;
    }
    this.userService.put(this.username, this.UserUpdateForm.value).subscribe(
      res => {
        this.alert.success('Update process successful..');
        this.router.navigate(['/login']);
      },
      error => {
        this.alert.error(' Error: ' + error);
        this.message = error;
      }
    );
  }

  updatePassword(){


    if (!this.PasswordUpdateForm.valid) {
      return;
    }
    if(this.PasswordUpdateForm.value['newpassword'] === this.PasswordUpdateForm.value['newpassword2']){
      this.error = '';
      this.userService.changePassword(this.PasswordUpdateForm.value).subscribe(
        res => {
          this.alert.success('.');
          this.router.navigate(['/login']);
        },
        error => {
          this.alert.error('You entered your current password incorrectly.');
          this.error = 'You entered your current password incorrectly.';
        }
        );
    } else {
      this.alert.error('Passwords must be the same.');
      this.error = 'Passwords must be the same.';
    }
  }

  get pf() { return this.PasswordUpdateForm.controls; }
  get uf() { return this.UserUpdateForm.controls; }

  LoadBackPage() {
    this.location.back();
  }
}
