import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuscarCarona } from './buscar-carona';

describe('BuscarCarona', () => {
  let component: BuscarCarona;
  let fixture: ComponentFixture<BuscarCarona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscarCarona],
    }).compileComponents();

    fixture = TestBed.createComponent(BuscarCarona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
