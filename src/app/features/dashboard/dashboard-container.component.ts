import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserView } from '../../core/models/user.model';
import { selectUserViews } from '../../store/selectors/user.selectors';
import { RouterOutlet } from '@angular/router';
import { RibbonComponent } from './components/ribbon/ribbon.component';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { UserActions } from '../../store/actions/user.actions';


@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RibbonComponent,

  ],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent implements OnInit {
  users$!: Observable<UserView[]>; 
  private store = inject(Store);

  constructor() {}

  ngOnInit(): void {
    this.store.dispatch(UserActions.loadUsers());
    this.users$ = this.store.select(selectUserViews);
  }
}
