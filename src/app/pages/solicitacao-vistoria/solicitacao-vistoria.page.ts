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
  IonIcon,
  IonButtons,
  IonBackButton,
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

@Component({
  selector: 'app-solicitacao-vistoria',
  templateUrl: './solicitacao-vistoria.page.html',
  standalone: true,
  styleUrls: ['./solicitacao-vistoria.page.scss'],
  imports: [
    IonBackButton,
    IonButtons,
    IonIcon,
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

  bairrosSabara: string[] = [
    'Adelmolândia',
    'Água Férrea',
    'Alto do Cabral',
    'Alto do Fidalgo',
    'Alvorada',
    'Ana Lúcia',
    'Área Rural de Sabará',
    'Arraial Velho',
    'Borba Gato',
    'Borges',
    'Caieira',
    'Centro',
    'Conjunto Morada da Serra',
    'Córrego da Ilha',
    'Distrito Industrial Simão da Cunha',
    'Esplanada',
    'Fogo Apagou',
    'Itacolomi',
    'Jardim Castanheiras',
    'Mangabeiras',
    'Mangueiras',
    'Morro da Cruz',
    'Morro São Francisco',
    'Nações Unidas',
    'Nossa Senhora da Conceição',
    'Nossa Senhora de Fátima',
    'Nossa Senhora do Ó',
    'Novo Alvorada',
    'Novo Horizonte',
    'Novo Santa Inês',
    'Paciência',
    'Padre Chiquinho',
    'Pompeu',
    'Praia dos Bandeirantes',
    'Rio Negro',
    'Roça Grande',
    'Rosário',
    'Santana',
    'Santo Antônio (Roça Grande)',
    'São José',
    'Siderúrgica',
    'Sobradinho',
    'Terra Santa',
    'Valparaíso',
    'Vila Amélia Moreira',
    'Vila Bom Retiro',
    'Vila Campinas',
    'Vila dos Coqueiros',
    'Vila Esperança',
    'Vila Eugênio Rossi',
    'Vila Francisco de Moura',
    'Vila Marzagão',
    'Vila Michel',
    'Vila Nova Vista',
    'Vila Real',
    'Vila Rica',
    'Vila Santa Cruz',
    'Vila Santa Rita',
    'Vila Santo Antônio de Pádua',
    'Vila São Sebastião',
  ];

  bairrosFiltrados: string[] = [];
  mostrarListaBairros: boolean = false;
  selecaoAutomatica: boolean = false;

  readonly GAS_URL =
    'https://script.google.com/macros/s/AKfycbzOy8N1a_Ojfpa1IvMlJe5b3HHfrTCpjtECwWUXHijSA38MPJAAp4ZQLzJffIQTXcoc/exec';
  readonly RECAPTCHA_KEY = '6Lc2N6AsAAAAALHYvWU4qUdHoTlxC2lo0KY9oLBH';

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
    script.src = `https://www.google.com/recaptcha/api.js?render=${this.RECAPTCHA_KEY}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  bairroValidoValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const termoDigitado = control.value.toLowerCase().trim();
    const bairroExiste = this.bairrosSabara.some(
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
    this.bairrosFiltrados = this.bairrosSabara.filter((bairro) =>
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
    if (this.form.invalid) {
      this.alertCtrl
        .create({
          header: 'Formulário Inválido',
          message: 'Preencha todos os campos obrigatórios corretamente',
          buttons: ['OK'],
        })
        .then((alert) => alert.present());
      return;
    }

    if (!this.comprovanteResidenciaFoto) {
      // Assuming this is a File object in your component class
      this.alertCtrl
        .create({
          header: 'Comprovante de residência faltando.',
          message:
            'O envio da foto do Comprovante de Residência é obrigatório.',
          buttons: ['OK'],
        })
        .then((alert) => alert.present());
      return;
    }

    if (this.fotosSelecionadas.length === 0) {
      // Assuming this is a File[] in your component class
      this.alertCtrl
        .create({
          header: 'Fotos do local faltando.',
          message: 'Adicione pelo menos uma foto do local.',
          buttons: ['OK'],
        })
        .then((alert) => alert.present());
      return;
    }

    let loading = await this.loadingCtrl.create({
      message: 'Obtendo localização e enviando ocorrência...',
    });
    await loading.present();

    let coordenadasGps = '';

    // Lógica para capturar o GPS caso o usuário marque a caixa
    if (this.form.get('estouNoLocal')?.value) {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        coordenadasGps = `${position.coords.latitude}, ${position.coords.longitude}`;
      } catch (error) {
        loading.dismiss();
        this.alertCtrl
          .create({
            header: 'Falha no GPS',
            message:
              'Não conseguimos acessar sua localização. Verifique se o GPS está ligado e se o app tem permissão, ou desmarque a opção "Estou no local".',
            buttons: ['OK'],
          })
          .then((alert) => alert.present());
        return;
      }
    }
    loading.dismiss();

    loading = await this.loadingCtrl.create({
      message: 'Enviando ocorrência...',
    });
    await loading.present();

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
        .post(this.GAS_URL, JSON.stringify(payload), {
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
          .execute(this.RECAPTCHA_KEY, { action: 'submit' })
          .then((token: string) => resolve(token))
          .catch((err: any) =>
            reject(new Error('Falha ao gerar o token de segurança.')),
          );
      });
    });
  }
}
