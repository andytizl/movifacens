import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OferecerCarona } from './oferecer-carona';

describe('OferecerCarona', () => {
  let component: OferecerCarona;
  let fixture: ComponentFixture<OferecerCarona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OferecerCarona],
    }).compileComponents();

    fixture = TestBed.createComponent(OferecerCarona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
