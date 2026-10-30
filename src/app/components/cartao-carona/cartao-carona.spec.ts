import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartaoCarona } from './cartao-carona';

describe('CartaoCarona', () => {
  let component: CartaoCarona;
  let fixture: ComponentFixture<CartaoCarona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartaoCarona],
    }).compileComponents();

    fixture = TestBed.createComponent(CartaoCarona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
