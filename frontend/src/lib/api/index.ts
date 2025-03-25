// API service for interacting with the backend
// This file contains functions to call the API endpoints defined in express.ts

// Changed from external URL to internal relative paths
const API_URL = '/api';

interface LoginResponse {
  email: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

interface EntityIdResponse {
  entityId: string;
}

export interface FullName {
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
}

// export async function getCustomerEntity(email: string, firstName: string, lastName: string, middleName?: string, suffix?: string): Promise<EntityIdResponse> {
//   const response = await fetch(`${API_URL}/customer_entity`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ 
//       email, 
//       firstName, 
//       lastName, 
//       middleName, 
//       suffix 
//     }),
//   });
//   return response.json();
// }

export async function findEntity(email: string): Promise<EntityIdResponse> {
  const response = await fetch(`${API_URL}/find_entity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export interface Address {
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  addressLine2?: string;
  country?: string;
}

export interface PhoneNumber {
  number: string;
  countryCode?: string;
}

export interface BirthDate {
  day?: number;
  month?: number;
  year?: number;
}

export interface IndividualGovernmentId {
  ssn?: string;
}

export interface Responsibilities {
  jobTitle?: string;
  isController?: boolean;
  isOwner?: boolean;
  ownershipPercentage?: number;
}

export interface BusinessEntityParams {
  email: string;
  legalBusinessName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  addressLine1: string;
  city: string;
  stateOrProvince: string;
  postalCode: string;
  addressLine2?: string;
  country?: string;
  phoneNumber: string;
  phoneCountryCode?: string;
  day?: number;
  month?: number;
  year?: number;
  ssn?: string;
  jobTitle?: string;
  isController?: boolean;
  isOwner?: boolean;
  ownershipPercentage?: number;
  ein?: string;
  description?: string;
}

export async function createBusinessEntity(params: BusinessEntityParams): Promise<EntityIdResponse> {
  const response = await fetch(`${API_URL}/business_entity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
}

export interface Invoice {
  id: string;
  // Add more invoice properties as needed
}

export interface InvoicesResponse {
  invoices: {
    data: Invoice[];
    count: number;
  };
}

export async function getInvoices(entityId: string): Promise<InvoicesResponse> {
  const response = await fetch(`${API_URL}/get_invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entityId }),
  });
  return response.json();
}

export interface CreateInvoiceParams {
  entityId: string;
  amount: number;
}

export interface InvoiceResponse {
  invoiceId: string;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
  const response = await fetch(`${API_URL}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  return response.json();
}