async function getUserData() {
    const res = await fetch('http://localhost:3000/api/passes').then((res) => res.json());
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    // if (!res.ok) {
    //   // This will activate the closest `error.js` Error Boundary
    //   throw new Error('Failed to fetch data')
    // }
   
    return res.data
  }

interface UserInterface{
  _id:string;
  groups: [
    string
  ];
  user:string;
  pass:string;
  scope_id:string

}

export default async function UsersPage(){
    const users = await getUserData();

    return(
      <>
      <ul>
        {users.map((d:UserInterface) => (<li key={d._id}>{d.user}</li>))} 
         </ul>
     </>
    )
}