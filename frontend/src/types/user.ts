export enum UserStatus {
    ACTIVE = 'active',
    LOCKED = 'locked',
    INACTIVE = 'inactive',
}

export interface User {
    id: string;
    name: string | null;
    phone: string | null;
    address: string | null;
    status: UserStatus;
    total_listings: number;   
}