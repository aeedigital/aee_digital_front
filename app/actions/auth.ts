import {UserRole} from './permitions'
import { getPrimaryRole, normalizeRoles } from "@/lib/access-control";

export type Authorization = {
    role: UserRole;
    groups: UserRole[];
    scope?: string;
}

export async function Auth(user: string, pass: string): Promise<Authorization>{
    
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

    const users: any[] = await fetch(`${apiUrl}/passes?user=${user}&pass=${pass}`).then((res) => res.json());
   
    const userInfo = users[0];
    // const {groups: [role], scope_id: scope} = userInfo

    const groups = normalizeRoles(userInfo?.groups);
    const role = getPrimaryRole(groups);
    let scope

    if (!role) {
        throw new Error("Usuário sem grupo de acesso reconhecido");
    }
    
    if(userInfo?.scope_id != "*")
    {
        scope = userInfo?.scope_id
    }
    return {
        scope,
        groups,
        role
    }
}
