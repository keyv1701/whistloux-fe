export interface Player {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  pay: number | null;
  validSince?: string; // Format ISO 'YYYY-MM-DD'
  validUntil?: string | null; // Format ISO 'YYYY-MM-DD', peut être null
  address: string;
  gsm?: string;
  phoneNumber?: string;
}
