import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';

import {
  IonHeader,
  IonList,
  IonToolbar,
  IonContent,
  IonTitle,
  IonItem,
  IonInput,
  IonButton,
  IonLabel,
  IonFooter,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { NgxMaskDirective } from 'ngx-mask';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Geolocation } from '@capacitor/geolocation';
import {
  IArquivoBase64,
  ISolicitacaoVistoriaPayload,
} from 'src/app/interfaces/ISolicitacaoVistoria';
import { converterPhotoParaBase64 } from 'src/app/helper/photoToBase64';
import {
  bairrosSabara,
  GAS_URL,
  RECAPTCHA_KEY,
} from 'src/app/helper/constants';

@Component({
  selector: 'app-solicitacao-vistoria',
  templateUrl: './solicitacao-vistoria.page.html',
  standalone: true,
  styleUrls: ['./solicitacao-vistoria.page.scss'],
  imports: [
    IonCheckbox,
    IonFooter,
    IonLabel,
    IonButton,
    IonInput,
    IonItem,
    IonTitle,
    IonContent,
    IonToolbar,
    IonList,
    IonHeader,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
  ],
})
export class SolicitacaoVistoriaPage implements OnInit {
  form: FormGroup;
  fotosSelecionadas: Photo[] = [];
  comprovanteResidenciaFoto: Photo | null = null;
  protocolo: string = '';
  sucesso: boolean = false;

  bairrosFiltrados: string[] = [];
  mostrarListaBairros: boolean = false;
  selecaoAutomatica: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router,
  ) {
    this.form = this.fb.group({
      descricao: ['', Validators.required],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      identidade: ['', [Validators.required]],
      orgaoEmissor: ['', [Validators.required]],
      celular: ['', [Validators.required, Validators.minLength(10)]],
      telefone: [''],
      email: ['', [Validators.required, Validators.email]],
      cep: ['', [Validators.required, Validators.minLength(8)]],
      endereco: ['', Validators.required],
      numero: ['', Validators.required],
      bairro: [
        '',
        [Validators.required, this.bairroValidoValidator.bind(this)],
      ],
      complemento: [''],
      referencia: [''],
      numeroIptu: [''],
      estouNoLocal: [false],
    });

    this.form.get('bairro')?.valueChanges.subscribe((termo) => {
      this.filtrarBairros(termo);
    });
  }

  ngOnInit() {
    this.carregarScriptRecaptcha();
  }

  private carregarScriptRecaptcha() {
    const scriptId = 'google-recaptcha-script';

    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  bairroValidoValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const termoDigitado = control.value.toLowerCase().trim();
    const bairroExiste = bairrosSabara.some(
      (bairroOficial) => bairroOficial.toLowerCase() === termoDigitado,
    );
    return bairroExiste ? null : { bairroInvalido: true };
  }

  filtrarBairros(termo: string) {
    if (this.selecaoAutomatica) {
      this.selecaoAutomatica = false;
      this.mostrarListaBairros = false;
      return;
    }
    const busca = termo?.toLowerCase() || '';
    if (busca.trim() === '') {
      this.mostrarListaBairros = false;
      this.bairrosFiltrados = [];
      return;
    }
    this.bairrosFiltrados = bairrosSabara.filter((bairro) =>
      bairro.toLowerCase().includes(busca),
    );
    this.mostrarListaBairros = true;
  }

  selecionarBairro(bairro: string) {
    this.selecaoAutomatica = true;
    this.form.patchValue({ bairro: bairro });
    this.mostrarListaBairros = false;
    this.bairrosFiltrados = [];
  }

  async adicionarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Fotos do Local',
        promptLabelPhoto: 'Galeria',
        promptLabelPicture: 'Câmera',
      });
      this.fotosSelecionadas.push(image);
    } catch (error) {
      console.log('Cancelado pelo usuário ou erro na câmera', error);
    }
  }

  removerFoto(index: number) {
    this.fotosSelecionadas.splice(index, 1);
  }

  async adicionarComprovante() {
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Comprovante (Apenas Foto)',
        promptLabelPhoto: 'Galeria',
        promptLabelPicture: 'Câmera',
      });
      this.comprovanteResidenciaFoto = image;
    } catch (error) {
      console.log('Cancelado pelo usuário ou erro na câmera', error);
    }
  }

  removerComprovante() {
    this.comprovanteResidenciaFoto = null;
  }

  buscarCEP() {
    const cep: string = this.form.get('cep')?.value;

    if (cep && cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            this.selecaoAutomatica = true;
            this.form.patchValue({
              endereco: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf,
            });
            document.getElementById('inputNumero')?.focus();
          } else {
            alert('CEP não encontrado. Preencha manualmente.');
          }
        })
        .catch(() => alert('Erro ao buscar o CEP. Verifique a internet.'));
    }
  }

  async enviarSolicitacao() {
    if (
      this.form.invalid ||
      !this.comprovanteResidenciaFoto ||
      this.fotosSelecionadas.length === 0
    ) {
      this.exibirAlerta(
        'Atenção',
        'Preencha todos os campos e adicione as fotos obrigatórias.',
      );
      return;
    }

    let loading = await this.loadingCtrl.create({
      message: 'Processando solicitação...',
    });
    await loading.present();

    let coordenadasGps = '';

    // Lógica para capturar o GPS caso o usuário marque a caixa
    if (this.form.get('estouNoLocal')?.value) {
      loading.message = 'Obtendo localização...';
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        coordenadasGps = `${position.coords.latitude}, ${position.coords.longitude}`;
      } catch (gpsError) {
        console.warn('Falha no GPS', gpsError);
      }
    }

    loading.message = 'Enviando ocorrência...';

    try {
      const recaptchaToken = await this.executeRecaptcha();
      const formValues = this.form.value;

      const fotosBase64: IArquivoBase64[] = await Promise.all(
        this.fotosSelecionadas.map(async (foto: Photo, index: number) => {
          const ext = foto.format || 'jpeg'; // Pega a extensão real gerada pela câmera
          return {
            nome: `Imagem_${index}.${ext}`,
            mimetype: `image/${ext}`,
            dados: await converterPhotoParaBase64(foto),
          };
        }),
      );

      // Processa o comprovante de residência
      const extComprovante = this.comprovanteResidenciaFoto.format || 'jpeg';
      const comprovanteBase64: IArquivoBase64 = {
        nome: `Comprovante_Residencia.${extComprovante}`,
        mimetype: `image/${extComprovante}`,
        dados: await converterPhotoParaBase64(this.comprovanteResidenciaFoto),
      };

      // Monta o payload final
      const payload: ISolicitacaoVistoriaPayload = {
        ...formValues,
        data: new Date(),
        coordenadas: coordenadasGps,
        recaptchaToken: recaptchaToken,
        fotosLocal: fotosBase64,
        comprovanteResidencia: comprovanteBase64,
      };

      this.http
        .post(GAS_URL, JSON.stringify(payload), {
          headers: new HttpHeaders({
            'Content-Type': 'text/plain;charset=utf-8',
          }),
        })
        .subscribe({
          next: (resposta: any) => {
            loading.dismiss();
            this.protocolo = resposta.protocolo;
            this.sucesso = true;

            // Navigation moved INSIDE the success callback to prevent race conditions
            if (this.protocolo != null) {
              this.router.navigate(['/solicitacao-vistoria/vistoria-criada'], {
                state: { protocolo: this.protocolo },
                replaceUrl: true,
              });
            }
          },
          error: (erro) => {
            loading.dismiss();
            this.alertCtrl
              .create({
                header: 'Erro',
                message: erro.error?.mensagem || 'Erro ao enviar ocorrência',
                buttons: ['OK'],
              })
              .then((alert) => alert.present());
          },
        });
    } catch (error) {
      loading.dismiss();
      console.error(error);
      alert(
        'Falha no processamento dos arquivos ou na comunicação com o servidor.',
      );
    }
  }

  async exibirAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async executeRecaptcha(): Promise<string> {
    return new Promise((resolve, reject) => {
      const grecaptcha = (window as any).grecaptcha;

      if (!grecaptcha) {
        reject(
          new Error(
            'A biblioteca do reCAPTCHA não foi carregada no navegador.',
          ),
        );
        return;
      }

      grecaptcha.ready(() => {
        grecaptcha
          .execute(RECAPTCHA_KEY, { action: 'submit' })
          .then((token: string) => resolve(token))
          .catch((err: any) =>
            reject(new Error('Falha ao gerar o token de segurança.')),
          );
      });
    });
  }
}
