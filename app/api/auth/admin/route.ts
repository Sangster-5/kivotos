import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import readStream from '@/lib/read-stream';
import { encrypt, decrypt } from '@/lib/encryption-keys';


const POST = async (request: NextRequest) => {
    if(!request.body) return NextResponse.json({message: "Invalid Credentials"}, {status: 400});

    const data = JSON.parse(await readStream(request.body));

    const cookieStore = cookies();

    const client = await pool.connect();


    if(data.validateCookie) {
        const username = cookieStore.get('adminUsername');
        const password = cookieStore.get('adminPassword');
        const adminID = cookieStore.get('adminID');
        
        if(!username || !password || !adminID) return NextResponse.json({message: "Invalid Cookie"}, {status: 400}); 
        
        const values = [decrypt(username.value), decrypt(password.value), decrypt(adminID.value)];
        const query = "SELECT * FROM admin WHERE username = $1 AND password = $2 AND id = $3";
        const result = await client.query(query, values);
    
        if(result.rows.length < 1) return NextResponse.json({message: "Invalid Cookie",}, {status: 401});
        if(result.rows[0].id === parseInt(decrypt(adminID.value))) {
            const user = {
                id: parseInt(result.rows[0].id),
                username: result.rows[0].username,
                name: result.rows[0].name,
                approve_applications: result.rows[0].approve_applications,
                create_leases: result.rows[0].create_leases
            }
            client.release();

            return NextResponse.json({message: "Admin Cookie Validated", user: user}, {status: 200});
        } else {
            client.release();
            return NextResponse.json({message: "Unauthorized",}, {status: 401});
        }
    
    } else {
        const values = [data.username, data.password];
        const query = "SELECT * FROM admin WHERE username = $1 AND password = $2";
        const result = await client.query(query, values);

        if(result.rows.length >= 1) {
            const user = {
                id: result.rows[0].id,
                username: result.rows[0].username,
                name: result.rows[0].name,
                approve_applications: result.rows[0].approve_applications,
                create_leases: result.rows[0].create_leases
            }
        
            cookieStore.set('adminUsername', encrypt(user.username as string));
            cookieStore.set('adminPassword', encrypt(result.rows[0].password as string));
            cookieStore.set('adminID', encrypt(user.id.toString()));
            client.release();

            return NextResponse.json({message: "Admin Session Created", user: user}, {status: 200});
          } else  {
            client.release();
            return NextResponse.json({message: "Invalid Credentials"}, {status: 400});
          }
    }
}

export { POST };