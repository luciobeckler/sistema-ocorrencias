import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonIcon,
  IonFooter,
  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-vistoria-criada',
  templateUrl: './vistoria-criada.page.html',
  styleUrls: ['./vistoria-criada.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonFooter,
    IonIcon,
    IonContent,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
// Remova o OnInit e implemente as funções do Ionic
export class VistoriaCriadaPage {
  numeroProtocolo: string = '';

  constructor(private router: Router) {
    const currentNavigation = this.router.getCurrentNavigation();

    if (currentNavigation?.extras?.state) {
      this.numeroProtocolo = currentNavigation.extras.state['protocolo'];
    }
  }

  ionViewWillEnter() {
    if (!this.numeroProtocolo && history.state?.protocolo) {
      this.numeroProtocolo = history.state.protocolo;
    }
  }

  navigateBack() {
    this.numeroProtocolo = '';
    this.router.navigate(['/solicitacao-vistoria']);
  }
}
