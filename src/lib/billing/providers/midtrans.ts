import crypto from 'crypto'

export type MidtransEnvironment = 'sandbox' | 'production'

export interface MidtransConfig {
  merchantId: string
  serverKey: string
  clientKey: string
  environment: MidtransEnvironment
}

export interface CreateCheckoutParams {
  planId: string
  planName: string
  planPrice: number
  userId: string
  userEmail: string
  userName?: string
  successUrl: string
  cancelUrl: string
}

export interface BillingPortalParams {
  customerId: string
  returnUrl: string
}

export interface SubscriptionStatus {
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  trialEndsAt?: Date
}

export interface MidtransTransactionResponse {
  token: string
  redirect_url: string
  order_id: string
}

function getConfig(): MidtransConfig {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const clientKey = process.env.MIDTRANS_CLIENT_KEY
  const merchantId = process.env.MIDTRANS_MERCHANT_ID

  if (!serverKey || !clientKey || !merchantId) {
    throw new Error('Payment provider not configured: MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, or MIDTRANS_MERCHANT_ID not set')
  }

  return {
    merchantId,
    serverKey,
    clientKey,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  }
}

function getSnapBaseUrl(environment: MidtransEnvironment): string {
  return environment === 'production'
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1'
}

function getApiBaseUrl(environment: MidtransEnvironment): string {
  return environment === 'production'
    ? 'https://api.midtrans.com/v2'
    : 'https://api.sandbox.midtrans.com/v2'
}

function getAuthHeader(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}`
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<MidtransTransactionResponse> {
  const config = getConfig()
  const baseUrl = getSnapBaseUrl(config.environment)
  const auth = getAuthHeader(config.serverKey)

  const orderId = `NOVELIFY-${params.userId}-${Date.now()}`

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: params.planPrice,
    },
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: params.userName || params.userEmail,
      email: params.userEmail,
    },
    callbacks: {
      finish: params.successUrl,
      error: params.cancelUrl,
      cancel: params.cancelUrl,
    },
    item_details: [
      {
        id: params.planId,
        price: params.planPrice,
        quantity: 1,
        name: `Novelify ${params.planName} Plan`,
        category: 'Subscription',
      },
    ],
  }

  const response = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': auth,
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Midtrans API error: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  return {
    token: data.token,
    redirect_url: data.redirect_url,
    order_id: orderId,
  }
}

export async function createBillingPortal(params: BillingPortalParams): Promise<{ url: string }> {
  getConfig()
  throw new Error('Midtrans does not provide a self-service billing portal. Use the /pricing page to manage subscriptions.')
}

function verifySignature(payload: {
  order_id: string
  status_code: string
  gross_amount: string
  server_key: string
  signature_key: string
}): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${payload.server_key}`)
    .digest('hex')
  return hash === payload.signature_key
}

export async function handleWebhook(payload: any): Promise<{
  event: string
  subscriptionId?: string
  status?: string
  orderId?: string
  transactionStatus?: string
  fraudStatus?: string
}> {
  const config = getConfig()
  const auth = getAuthHeader(config.serverKey)

  const orderId = payload.order_id
  const transactionStatus = payload.transaction_status
  const fraudStatus = payload.fraud_status
  const statusCode = String(payload.status_code)
  const grossAmount = String(payload.gross_amount)
  const signatureKey = payload.signature_key

  if (!verifySignature({
    order_id: orderId,
    status_code: statusCode,
    gross_amount: grossAmount,
    server_key: config.serverKey,
    signature_key: signatureKey,
  })) {
    throw new Error('Invalid Midtrans webhook signature')
  }

  const apiBaseUrl = getApiBaseUrl(config.environment)
  const response = await fetch(`${apiBaseUrl}/${orderId}/status`, {
    headers: {
      'Authorization': auth,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to verify Midtrans transaction: ${response.status}`)
  }

  const verificationData = await response.json()

  const serverTransactionStatus = verificationData.transaction_status

  if (serverTransactionStatus !== transactionStatus) {
    throw new Error(`Midtrans transaction status mismatch: webhook says ${transactionStatus}, server says ${serverTransactionStatus}`)
  }

  let event = 'payment.unknown'
  let status: string | undefined

  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    event = 'payment.success'
    status = fraudStatus === 'accept' ? 'active' : 'pending_review'
  } else if (transactionStatus === 'pending') {
    event = 'payment.pending'
    status = 'pending'
  } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
    event = 'payment.failed'
    status = 'canceled'
  } else if (transactionStatus === 'refund' || transactionStatus === 'partial_refund') {
    event = 'payment.refund'
    status = 'refunded'
  }

  return {
    event,
    orderId,
    transactionStatus,
    fraudStatus,
    status,
  }
}

export async function getSubscriptionStatus(orderId: string): Promise<SubscriptionStatus> {
  const config = getConfig()
  const apiBaseUrl = getApiBaseUrl(config.environment)
  const auth = getAuthHeader(config.serverKey)

  const response = await fetch(`${apiBaseUrl}/${orderId}/status`, {
    headers: {
      'Authorization': auth,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Midtrans transaction status: ${response.status}`)
  }

  const data = await response.json()
  const transactionStatus = data.transaction_status

  let status: SubscriptionStatus['status'] = 'expired'
  if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
    status = 'active'
  } else if (transactionStatus === 'pending') {
    status = 'trialing'
  } else if (transactionStatus === 'expire') {
    status = 'expired'
  } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
    status = 'canceled'
  }

  return {
    status,
    cancelAtPeriodEnd: false,
  }
}
