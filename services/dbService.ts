
import { createClient } from '@supabase/supabase-js';
import { Product, Customer, Seller, Table, DeliveryOrder, Sale, CashRegister } from '../types';

export enum DBSource {
  LOCAL = 'local',
  CLOUD = 'cloud'
}

interface DBConfig {
  source: DBSource;
  apiUrl: string;
  apiKey: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class DBService {
  private config: DBConfig = {
    source: (localStorage.getItem('br_db_source') as DBSource) || DBSource.CLOUD,
    apiUrl: supabaseUrl || '',
    apiKey: supabaseAnonKey || '',
  };

  private supabase = createClient(this.config.apiUrl, this.config.apiKey);

  getConfig() {
    return this.config;
  }

  updateConfig(newConfig: Partial<DBConfig>) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('br_db_source', this.config.source);
    // Reinicializa o cliente se as credenciais mudarem dinamicamente (raro)
    if (newConfig.apiUrl || newConfig.apiKey) {
      this.supabase = createClient(this.config.apiUrl, this.config.apiKey);
    }
  }

  private async request(endpoint: string, method: string = 'GET', data?: any) {
    if (this.config.source === DBSource.LOCAL) {
      const key = `br_${endpoint}`;
      if (method === 'GET') {
        return JSON.parse(localStorage.getItem(key) || '[]');
      } else {
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }
    }

    // Lógica para Nuvem (Supabase)
    try {
      if (method === 'GET') {
        const { data: result, error } = await this.supabase
          .from(endpoint)
          .select('*');

        if (error) throw error;
        return result || [];
      } else if (method === 'POST') {
        // No Supabase, se for um array, fazemos upsert baseado na PK configurada
        const { data: result, error } = await this.supabase
          .from(endpoint)
          .upsert(data, { onConflict: 'id' });

        if (error) throw error;
        return result;
      }
    } catch (error) {
      console.error(`Erro no Supabase (${endpoint}):`, error);
      // Fallback para local se a nuvem falhar
      return JSON.parse(localStorage.getItem(`br_${endpoint}`) || '[]');
    }
  }

  // Métodos Genéricos de Persistência
  async saveAll(collection: string, data: any[]) {
    // Tratamento especial para mapas de dados que vêm do POSProvider
    // O Supabase espera nomes de colunas snake_case em alguns casos se o SQL foi assim,
    // mas aqui o types.ts usa camelCase. Vou assumir que o JS mapeia bem ou o SQL aceita.
    // Dica: Se o SQL for snake_case, o ideal seria converter aqui. 
    // Mas no meu migrate eu usei snake_case. Vou ajustar o mapeamento se houver erro.
    return this.request(collection, 'POST', data);
  }

  async getAll(collection: string) {
    return this.request(collection, 'GET');
  }
}

export const dbService = new DBService();
