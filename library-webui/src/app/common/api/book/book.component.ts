import { Component, OnInit } from '@angular/core';
import { Page } from 'src/app/shared/Page';
import { BookService } from 'src/app/services/book.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertifyService } from 'src/app/services/alertify.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  //ngx datatable parameters
  rows = [];
  cols = [];
  page = new Page();
  control = true;
  books = [];
  //search book form
  searchBookForm: FormGroup;
  message: string | undefined;

  constructor(private bookService: BookService,
              private alert: AlertifyService,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.control = true;
    this.loadStaticPage();
  }
  loadStaticPage() {
    this.setPage({ offset: 0 });
    this.searchBookForm = this.formBuilder.group({
      'name': [null, [Validators.minLength(3), Validators.required]]
    });
  }
  setPage(pageInfo) {
    this.page.page = pageInfo.offset;
    this.bookService.getAllPageable(this.page).subscribe(pagedData => {
      this.page.size = pagedData.size;
      this.page.page = pagedData.page;
      this.page.totalElements = pagedData.totalElements;
      this.rows = pagedData.content;
    });
  }

  searchBook() {
    if (!this.searchBookForm.valid) {
      return;
    }
    this.bookService.findAllByName(this.searchBookForm.value['name']).subscribe(
      res => {
        this.control = false;
        this.books = res;
        this.message = ' . ';
        this.alert.success(' Records found. ')
      },
      error => {
        this.control = true;
        this.loadStaticPage();
        this.alert.error('Christ no. No book record found.');
        this.message = ' Christ no. No book record found.';
      });
  }
  deleteBook(id) {
    this.bookService.delete(id).subscribe(res => {
      this.control = true;
      this.loadStaticPage();
      this.message = ' The record has been deleted. ';
      this.alert.success(' The record has been deleted. ');
    },
      error => {
        this.alert.error(' No Record Found.. ');
        this.message = ' No Record Found.. ';
      });
  }
  get sf() { return this.searchBookForm.controls; }
}
