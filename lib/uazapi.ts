const UAZAPI_URL = process.env.UAZAPI_URL || 'https://enerprojetos.uazapi.com';
const ADMIN_TOKEN = process.env.UAZAPI_ADMIN_TOKEN || '';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

export interface CreateInstanceResponse {
  success: boolean;
  instanceName?: string;
  instanceToken?: string;
  error?: string;
}

export interface ConnectResponse {
  success: boolean;
  qrcode?: string;
  status?: string;
  connected?: boolean;
  error?: string;
}

export interface StatusResponse {
  success: boolean;
  connected?: boolean;
  instanceName?: string;
  phoneNumber?: string;
  qrcode?: string;
  error?: string;
}

// Criar nova instância WhatsApp (usa token admin)
export async function createInstance(instanceName: string): Promise<CreateInstanceResponse> {
  try {
    const response = await fetch(`${UAZAPI_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'admintoken': ADMIN_TOKEN,
      },
      body: JSON.stringify({ Name: instanceName }),
    });

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      instanceName: data.name || instanceName,
      instanceToken: data.token,
    };
  } catch (error) {
    console.error('Erro ao criar instância:', error);
    return { success: false, error: 'Falha ao criar instância' };
  }
}

// Conectar instância e obter QR Code (usa token da instância)
export async function connectInstance(instanceToken: string): Promise<ConnectResponse> {
  try {
    console.log('[UAZAPI] Conectando instância com token:', instanceToken.substring(0, 8) + '...');

    const response = await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instanceToken,
      },
    });

    const data = await response.json();
    console.log('[UAZAPI] Resposta connect:', JSON.stringify({
      connected: data.connected,
      hasQrcode: !!data.qrcode,
      qrcodeLength: data.qrcode?.length || 0,
      status: data.status,
      error: data.error || data.message,
      code: data.code
    }));

    // Token inválido - instância foi deletada
    if (data.code === 401 || data.message === 'Invalid token.') {
      return { success: false, error: 'TOKEN_INVALID' };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    // QR Code está em data.instance.qrcode, não diretamente em data.qrcode
    const qrcode = data.instance?.qrcode || data.qrcode || '';

    return {
      success: true,
      qrcode: qrcode,
      status: data.instance?.status || 'connecting',
      connected: data.connected === true,
    };
  } catch (error) {
    console.error('[UAZAPI] Erro ao conectar instância:', error);
    return { success: false, error: 'Falha ao conectar instância' };
  }
}

// Verificar status da instância (usa /instance/connect que retorna status real)
export async function getInstanceStatus(instanceToken: string): Promise<StatusResponse> {
  try {
    // A API /status retorna info do servidor, não da instância
    // Usamos /instance/connect para obter o status real
    const response = await fetch(`${UAZAPI_URL}/instance/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instanceToken,
      },
    });

    const data = await response.json();

    return {
      success: true,
      connected: data.connected === true,
      instanceName: data.instance?.name || data.name || '',
      phoneNumber: data.jid || data.instance?.owner || '',
      qrcode: data.qrcode || '',
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return { success: false, error: 'Falha ao verificar status' };
  }
}

// Configurar webhook do N8N
export async function setWebhook(instanceToken: string): Promise<boolean> {
  try {
    console.log('[UAZAPI] Configurando webhook:', N8N_WEBHOOK_URL);

    const response = await fetch(`${UAZAPI_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instanceToken,
      },
      body: JSON.stringify({
        url: N8N_WEBHOOK_URL,
        enabled: true,
        events: ['messages', 'message', 'messages.upsert', 'messages.update', 'connection.update'],
        // Excluir mensagens enviadas pela API e de grupos
        excludeMessages: ['wasSentByApi', 'isGroupYes'],
      }),
    });

    const data = await response.json();
    console.log('[UAZAPI] Resposta webhook:', JSON.stringify(data));

    // Verifica se o webhook foi configurado com enabled: true
    if (Array.isArray(data) && data.length > 0) {
      return data[0].enabled === true;
    }

    return response.ok;
  } catch (error) {
    console.error('[UAZAPI] Erro ao configurar webhook:', error);
    return false;
  }
}

// Verificar se webhook está configurado
export async function getWebhook(instanceToken: string): Promise<{ configured: boolean; url?: string; enabled?: boolean }> {
  try {
    const response = await fetch(`${UAZAPI_URL}/webhook`, {
      method: 'GET',
      headers: {
        'token': instanceToken,
      },
    });

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        configured: true,
        url: data[0].url,
        enabled: data[0].enabled,
      };
    }

    return { configured: false };
  } catch (error) {
    console.error('[UAZAPI] Erro ao verificar webhook:', error);
    return { configured: false };
  }
}

// Desconectar instância
export async function disconnectInstance(instanceToken: string): Promise<boolean> {
  try {
    console.log('[UAZAPI] Solicitando desconexão da instância...');

    // AbortController para evitar que a requisição fique pendente infinitamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de timeout

    const response = await fetch(`${UAZAPI_URL}/instance/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': instanceToken,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('[UAZAPI] Resposta desconexão:', response.status);
    return response.ok;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[UAZAPI] Timeout na desconexão (8s atingido)');
    } else {
      console.error('[UAZAPI] Erro ao desconectar:', error);
    }
    return false;
  }
}

// Deletar instância
export async function deleteInstance(instanceToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${UAZAPI_URL}/instance/delete`, {
      method: 'DELETE',
      headers: {
        'token': instanceToken,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao deletar instância:', error);
    return false;
  }
}
