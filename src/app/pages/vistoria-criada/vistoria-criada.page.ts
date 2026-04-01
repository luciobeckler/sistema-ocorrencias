import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonToolbar,
  IonIcon,
  IonFooter,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-vistoria-criada',
  templateUrl: './vistoria-criada.page.html',
  styleUrls: ['./vistoria-criada.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonIcon,
    IonContent,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class VistoriaCriadaPage implements OnInit {
  numeroProtocolo: string = '';

  constructor() {}

  ngOnInit() {
    this.numeroProtocolo = history.state.protocolo;
  }
}
