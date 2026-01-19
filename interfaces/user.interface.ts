export interface User {
    _id: string;
    user: string;
    pass: string;
    groups: string[];
    scope_id: string;
    createdAt?: string;
    updatedAt?: string;
    lastLogged?: string | null;
}

export interface UserGroup {
    _id: string;
    name: string;
    description?: string;
}
