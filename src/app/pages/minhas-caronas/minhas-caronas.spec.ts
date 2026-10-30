import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MinhasCaronas } from './minhas-caronas';

describe('MinhasCaronas', () => {
  let component: MinhasCaronas;
  let fixture: ComponentFixture<MinhasCaronas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasCaronas],
    }).compileComponents();

    fixture = TestBed.createComponent(MinhasCaronas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
