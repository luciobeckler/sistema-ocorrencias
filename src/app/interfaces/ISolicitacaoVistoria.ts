export interface ISolicitacaoVistoria {
  descricao: string;
  data: Date;
  horario: string;
  nome: string;
  cpf: string;
  identidade: string;
  orgaoEmissor: string;
  celular: string;
  telefone?: string;
  email: string;
  endereco: string;
  bairro: string;
  numero: string;
  cep: string;
  complemento?: string;
  coordenadas: string;
  referencia: string;
  numeroIptu: string;

  fotosLocal: File[];
  comprovanteResidencia?: File;
  recaptchaToken: string;
}

export interface IArquivoBase64 {
  nome: string;
  mimetype: string;
  dados: string;
}

export interface ISolicitacaoVistoriaPayload extends Omit<
  ISolicitacaoVistoria,
  'fotosLocal' | 'comprovanteResidencia'
> {
  fotosLocal: IArquivoBase64[];
  comprovanteResidencia?: IArquivoBase64 | null;
}
