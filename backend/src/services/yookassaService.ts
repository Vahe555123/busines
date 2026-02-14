const YOO_SHOP_ID = process.env.YOO_SHOP_ID ?? '';
const YOO_SECRET_KEY = process.env.YOO_SECRET_KEY ?? '';

const YOO_API = 'https://api.yookassa.ru/v3/payments';

export function isYooConfigured(): boolean {
  return Boolean(YOO_SHOP_ID && YOO_SECRET_KEY);
}

export type CreatePaymentParams = {
  amount: number;
  returnUrl: string;
  description: string;
  idempotenceKey: string;
};

export type CreatePaymentResult = {
  id: string;
  status: string;
  confirmationUrl: string | null;
};

export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
  if (!isYooConfigured()) {
    throw new Error('ЮKassa не настроена. Укажите YOO_SHOP_ID и YOO_SECRET_KEY в .env');
  }
  const auth = Buffer.from(`${YOO_SHOP_ID}:${YOO_SECRET_KEY.replace(/\s/g, '')}`).toString('base64');
  const body = {
    amount: {
      value: params.amount.toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: params.returnUrl,
    },
    description: params.description.slice(0, 128),
  };
  const res = await fetch(YOO_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      'Idempotence-Key': params.idempotenceKey,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    id?: string;
    status?: string;
    confirmation?: { confirmation_url?: string };
    code?: string;
    description?: string;
  };
  if (!res.ok) {
    throw new Error(data.description ?? data.code ?? `YooKassa error ${res.status}`);
  }
  return {
    id: data.id ?? '',
    status: data.status ?? 'pending',
    confirmationUrl: data.confirmation?.confirmation_url ?? null,
  };
}
