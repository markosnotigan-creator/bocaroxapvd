
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

            // Processamento do Protocolo Toledo Prix 3
            // O protocolo geralmente envia STX (0x02) + PESO + ETX (0x03)
            // Exemplo de string: [STX]00.500[ETX] ou apenas números seguidos de CR

            // 1. Limpa o buffer se ficar muito grande (evita vazamento de memória)
            if (this.buffer.length > 50) {
              this.buffer = this.buffer.slice(-50);
            }

            // 2. Tenta encontrar um padrão de peso válido (X.XXX)
            // Regex procura por STX (opcional), seguido de dígitos e ponto
            const match = this.buffer.match(/(\d{1,3}\.\d{3})/);

            if (match) {
              const weightStr = match[1];
              const weight = parseFloat(weightStr);

              if (!isNaN(weight)) {
                onData(weight, undefined);
                // Limpa o buffer após leitura com sucesso para evitar ler o mesmo dado
                // Mantém apenas o finalzinho caso tenha cortado o próximo pacote
                const lastIndex = this.buffer.lastIndexOf(weightStr);
                this.buffer = this.buffer.substring(lastIndex + weightStr.length);
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
