import {UserRole} from './permitions'

export type Authorization = {
    role: UserRole;
    scope?: string;
}

export async function Auth(user: string, pass: string): Promise<Authorization>{
    
    const users: any[] = await fetch(`http://localhost:3000/api/passes?user=${user}&pass=${pass}`).then((res) => res.json());
   
    const userInfo = users[0];
    // const {groups: [role], scope_id: scope} = userInfo

    let role = userInfo?.groups[0];
    let scope
    
    if(userInfo?.scope_id != "*")
    {
        scope = userInfo?.scope_id
    }
    return {
        scope,
        role
    }
}