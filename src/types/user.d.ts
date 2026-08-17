export type UserRole = 'ADMIN' | 'MANAGER' | 'CLIENT' | 'USER';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=user.d.ts.map