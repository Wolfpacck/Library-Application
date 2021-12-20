import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthorService } from 'src/app/services/author.service';
import { Page } from 'src/app/shared/Page';
import { ModalDirective } from 'ngx-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrls: ['./author.component.css']
})
export class AuthorComponent implements OnInit {
  authors = [];
  rows = [];
  cols = [];
  page = new Page();
  control = true;
  controlAuthorForm = true;
  //form parameters
  AuthorForm: FormGroup;

  searchForm: FormGroup;
  message: string | undefined;
  constructor(private authorService: AuthorService,
              private alert: AlertifyService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.control = true;
    this.loadStaticPage();
  }

  loadStaticPage(){
    this.setPage({ offset: 0 });
    this.searchForm=  this.formBuilder.group({
      'name': [null, [Validators.minLength(3)]]
    });
    this.AuthorForm = this.formBuilder.group({
      'name': [null, [Validators.required]],
      'surname': [null, [Validators.required]],
      'about': [null, [Validators.required]],
      'email': [null, [Validators.email]],
      'phone': [null, [Validators.required]]
    });
  }

  loadAuthors(){
    this.authorService.getAll().subscribe(res => {
      this.authors = res;
    });
  }

  loadAuthorFormPanel(){
    this.controlAuthorForm=true;
    this.AuthorForm = this.formBuilder.group({
      'name': [null, [Validators.required]],
      'surname': [null, [Validators.required]],
      'about': [null, [Validators.required]],
      'email': [null, [Validators.email,Validators.required]],
      'phone': [null, [Validators.required]],
    });
  }

  setPage(pageInfo) {
    this.page.page = pageInfo.offset;
    this.authorService.getAllPageable(this.page).subscribe(pagedData => {
      this.page.size = pagedData.size;
      this.page.page = pagedData.page;
      this.page.totalElements = pagedData.totalElements;
      this.rows = pagedData.content;
    });
  }
  saveAuthor(){
    if (!this.AuthorForm.valid) {
      return;
    }
    this.authorService.post(this.AuthorForm.value).subscribe(
      res => {
      this.AuthorForm.reset();
      this.setPage({ offset: 0 });
      this.controlAuthorForm = false;
      this.message = 'Registration successful.';
      this.alert.success( 'Registration successful.');
      },
      error =>{
        this.alert.error('Registration failed <br/> Error : ' + error);
        this.message = 'Registration failed';
      });
  }
  deleteAuthor(id){
    console.log(id);
    this.authorService.delete(id).subscribe(
      res=>{
        this.alert.success('Your registration has been deleted.');
        this.setPage({ offset: 0 });
        this.control = true;
        this.loadStaticPage();
      },
      error =>{
        this.alert.error('Your registration could not be deleted..<br/>Error : ' + error);
        this.loadStaticPage();
      }
    );
  }

  searchAuthor(){
    if (!this.searchForm.valid) {
      return;
    }
    this.authorService.findAllByName(this.searchForm.value['name']).subscribe(res => {
      this.authors = res;
      this.control = false;
      this.message = 'Records found.';
      this.alert.success('Records found.');
    },
    error =>{
      this.message = 'No record found' ;
      this.alert.error('No record found ');
      this.control = true;
      this.loadStaticPage();
    });
  }

  get sf() { return this.searchForm.controls; }
  get f() { return this.AuthorForm.controls; }
}
