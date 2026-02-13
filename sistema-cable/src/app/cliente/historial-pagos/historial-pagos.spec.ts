import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPagos } from './historial-pagos';

describe('HistorialPagos', () => {
  let component: HistorialPagos;
  let fixture: ComponentFixture<HistorialPagos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPagos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPagos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
