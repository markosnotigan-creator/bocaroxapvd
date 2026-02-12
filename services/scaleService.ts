
export class ScaleService {
  private port: any | null = null;
  private reader: any | null = null;
  private keepReading: boolean = false;
  private buffer: string = '';

  async connect(onData: (weight: number, rawData?: string) => void, options?: { baudRate?: number }): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        alert('Web Serial API não suportada neste navegador. Use Chrome, Edge ou Opera.');
        return false;
      }

      // @ts-ignore
      this.port = await navigator.serial.requestPort();

      const baudRate = options?.baudRate || 9600;
      await this.port.open({ baudRate, dataBits: 8, stopBits: 1, parity: 'none' });

      this.keepReading = true;
      this.readLoop(onData);
      return true;
    } catch (error) {
      console.error('Falha ao conectar à balança:', error);
      return false;
    }
  }

  private async readLoop(onData: (weight: number, rawData?: string) => void) {
    const textDecoder = new TextDecoder();

    while (this.port?.readable && this.keepReading) {
      try {
        this.reader = this.port.readable.getReader();

        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;

          if (value) {
            const chunk = textDecoder.decode(value);
            this.buffer += chunk;

            // Passa o dado cru para debug na tela de configurações
            onData(-1, chunk);

            // 1. Limpeza preventiva do buffer (50 chars é muito pouco para alguns protocolos rapidos)
            if (this.buffer.length > 200) {
              this.buffer = this.buffer.slice(-100);
            }

            // 2. Tenta encontrar um padrão de peso válido (X.XXX ou X,XXX)
            // Regex melhorada:
            // - Aceita ponto ou vírgula
            // - Opcional: STX (\x02) ou caracteres de controle antes
            // - Captura grupos de digitos
            const match = this.buffer.match(/(\d{1,3}[.,]\d{3})/);

            if (match) {
              // Normaliza para ponto flutuante JS (troca vírgula por ponto)
              const weightStr = match[1].replace(',', '.');
              const weight = parseFloat(weightStr);

              if (!isNaN(weight)) {
                onData(weight, undefined);

                // Limpa o buffer até o final do peso encontrado para processar o próximo
                const lastIndex = this.buffer.lastIndexOf(match[1]);
                if (lastIndex !== -1) {
                  this.buffer = this.buffer.substring(lastIndex + match[1].length);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro na leitura da serial:', error);
        break;
      } finally {
        if (this.reader) {
          this.reader.releaseLock();
        }
      }
    }
  }

  async disconnect() {
    this.keepReading = false;
    if (this.reader) {
      await this.reader.cancel();
    }
    if (this.port) {
      await this.port.close();
    }
    this.port = null;
    this.reader = null;
    this.buffer = '';
  }

  isConnected(): boolean {
    return this.port !== null && this.port.readable !== null;
  }
}

export const scaleService = new ScaleService();
