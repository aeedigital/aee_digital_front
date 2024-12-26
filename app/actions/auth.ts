import {UserRole} from './permitions'

export type Authorization = {
    role: UserRole;
    scope?: string;
}

export async function Auth(user: string, pass: string): Promise<Authorization>{
    
    let apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

    const users: any[] = await fetch(`${apiUrl}/api/passes?user=${user}&pass=${pass}`).then((res) => res.json());
   
console.log("AUTH", users)

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