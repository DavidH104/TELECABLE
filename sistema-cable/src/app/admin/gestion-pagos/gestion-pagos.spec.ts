import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPagos } from './gestion-pagos';

describe('GestionPagos', () => {
  let component: GestionPagos;
  let fixture: ComponentFixture<GestionPagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionPagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionPagos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
