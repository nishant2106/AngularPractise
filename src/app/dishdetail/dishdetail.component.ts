import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
import { CommentStmt } from '@angular/compiler';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
})
export class DishdetailComponent implements OnInit {
  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('ffrom') commentFormDirective;

  formErrors = {
    author: '',
    rating: 5,
    comment: ''
  };
  validationMessages = {
    author: {
      required: 'Name is required.',
      minlength: 'Name must be at least 2 characters long.',
      maxlength: 'Name cannot be more than 25 characters long.',
    },
    comment: {
      required: 'Comment is required.'
    }
  };

  constructor(
    private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cb: FormBuilder,
    @Inject('baseURL') public baseURL
  ) {
    this.createForm();
  }

  createForm(){
    this.commentForm = this.cb.group({
      author: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      rating: [5],
      comment: [
        '',
        [
          Validators.required
        ],
      ],
      date: Date
    });
    this.commentForm.valueChanges.subscribe((data) =>
    this.onValueChanged(data));
    this.onValueChanged();
  }
  onValueChanged(data?: any) {
    this.comment = this.commentForm.value;
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error messages
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + '  ';
            }
          }
        }
      }
    }
  }

  ngOnInit() {
    this.dishservice
      .getDishIds()
      .subscribe((dishIds) => (this.dishIds = dishIds));
    this.route.params
      .pipe(
        switchMap((params: Params) => this.dishservice.getDish(params['id']))
      )
      .subscribe((dish) => {
        this.dish = dish;
        this.setPrevNext(dish.id);
      },
      errmess => this.errMess = <any>errmess);
  }
  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[
      (this.dishIds.length + index - 1) % this.dishIds.length
    ];
    this.next = this.dishIds[
      (this.dishIds.length + index + 1) % this.dishIds.length
    ];
  }
  onSubmit() {
    this.comment = this.commentForm.value;
    var d = new Date();
    var n = d.toISOString();
    this.comment.date = n;
    this.dish.comments.push(this.comment);
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: '',
      date:''
    });
    this.commentFormDirective.resetForm();
  }

  goBack(): void {
    this.location.back();
  }
  formatLabel(value: number) {
    if (value >= 5) {
      return Math.round(value / 1);
    }

    return value;
  }
}
