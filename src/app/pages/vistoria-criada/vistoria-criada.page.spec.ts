import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VistoriaCriadaPage } from './vistoria-criada.page';

describe('VistoriaCriadaPage', () => {
  let component: VistoriaCriadaPage;
  let fixture: ComponentFixture<VistoriaCriadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VistoriaCriadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
