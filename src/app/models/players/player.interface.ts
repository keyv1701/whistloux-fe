export interface Player {
  uuid: string;
  firstName: string;
  lastName: string;
  pseudo: string;
  email: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  valid?: boolean;
  address: string;
  gsm?: string;
  phoneNumber?: string;
}
