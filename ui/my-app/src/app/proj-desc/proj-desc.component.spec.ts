import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjDescComponent } from './proj-desc.component';

describe('ProjDescComponent', () => {
  let component: ProjDescComponent;
  let fixture: ComponentFixture<ProjDescComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjDescComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjDescComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
