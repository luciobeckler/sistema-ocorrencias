import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitacaoVistoriaPage } from './solicitacao-vistoria.page';

describe('SolicitacaoVistoriaPage', () => {
  let component: SolicitacaoVistoriaPage;
  let fixture: ComponentFixture<SolicitacaoVistoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitacaoVistoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
