import { ToolbarComponent } from './toolbar.component';
import { DOCUMENT } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthModule } from '@auth0/auth0-angular';
import { provideMockStore } from '@ngrx/store/testing';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ToolbarComponent,
        RouterTestingModule, // Add RouterTestingModule to provide ActivatedRoute
        AuthModule.forRoot({
          // Properly mock Auth0
          domain: 'test.domain.com',
          clientId: 'test-client-id',
          authorizationParams: {
            redirect_uri: window.location.origin,
          },
        }),
      ],
      providers: [
        provideMockStore({ initialState: {} }), // Provide mock store
        { provide: DOCUMENT, useValue: document }, // Provide document for Auth0 service
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
