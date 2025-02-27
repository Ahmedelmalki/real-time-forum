export async function isAuthenticated() {
    const res = await fetch('/user_id');
    if (!res.ok) {
        console.error('error fetching user id');
        return;
    }
     const user_id = await res.json();     
     return user_id.Val;
}
