import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/solicitacao-vistoria/solicitacao-vistoria.page').then(
        (m) => m.SolicitacaoVistoriaPage,
      ),
  },
  {
    path: 'solicitacao-vistoria',
    loadComponent: () =>
      import('./pages/solicitacao-vistoria/solicitacao-vistoria.page').then(
        (m) => m.SolicitacaoVistoriaPage,
      ),
  },
  {
    path: 'vistoria-criada',
    loadComponent: () =>
      import('./pages/vistoria-criada/vistoria-criada.page').then(
        (m) => m.VistoriaCriadaPage,
      ),
  },
  {
    path: 'solicitacao-vistoria/vistoria-criada',
    loadComponent: () =>
      import('./pages/vistoria-criada/vistoria-criada.page').then(
        (m) => m.VistoriaCriadaPage,
      ),
  },
];
