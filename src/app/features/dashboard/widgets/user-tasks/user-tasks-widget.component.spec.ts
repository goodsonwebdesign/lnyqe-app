import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserTasksWidgetComponent } from './user-tasks-widget.component';
import { Task } from '@core/models/task.model';

describe('UserTasksWidgetComponent', () => {
  let fixture: ComponentFixture<UserTasksWidgetComponent>;
  let component: UserTasksWidgetComponent;

  const mockTasks: Task[] = [
    { id: '1', title: 'Task 1', description: 'Description 1', completed: false, dueDate: new Date() },
    { id: '2', title: 'Task 2', description: 'Description 2', completed: true, dueDate: new Date() },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTasksWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserTasksWidgetComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display tasks when tasks are provided', () => {
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();

    const taskElements = fixture.debugElement.queryAll(By.css('li'));
    expect(taskElements.length).toBe(2);
    expect(taskElements[0].nativeElement.textContent).toContain('Task 1');
    expect(taskElements[1].nativeElement.textContent).toContain('Task 2');
  });

  it('should display "no tasks" message when no tasks are provided', () => {
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();

    const noTasksEl = fixture.debugElement.query(By.css('p'));
    expect(noTasksEl.nativeElement.textContent).toContain('You have no tasks.');
  });

  it('should correctly apply the "completed" class to completed tasks', () => {
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();

    const taskElements = fixture.debugElement.queryAll(By.css('li'));
    const completedTask = taskElements[1].query(By.css('span'));

    expect(completedTask.classes['line-through']).toBeTrue();
  });
});
