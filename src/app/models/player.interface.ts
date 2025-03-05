export interface Player {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string; // Format ISO 'YYYY-MM-DD'
  pay: number;
  validUntil: string | null; // Format ISO 'YYYY-MM-DD', peut être null
  address: string;
  phone: string;
}
