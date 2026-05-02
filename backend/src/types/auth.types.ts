export type Role = 'ADMIN' | 'MEMBER';

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}
