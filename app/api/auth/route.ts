import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption-keys';
import readStream from '@/lib/read-stream';

const deleteCookies = (cookieStore: any) => {
  cookieStore.delete('email');
  cookieStore.delete('password');
  cookieStore.delete('userID');
}

export async function POST(request: NextRequest) {
  if (!request.body) return NextResponse.json({ error: "Invalid Credentials" }, { status: 400 });
  const data = JSON.parse(await readStream(request.body));
  const cookieStore = cookies();

  const client = await pool.connect();

  if (data.validateCookie) {
    const email = cookieStore.get('email');
    const password = cookieStore.get('password');
    const userID = cookieStore.get('userID');

    if (!email || !password || !userID) return client.release(), NextResponse.json({ error: "Invalid Cookie1" }, { status: 400 });

    const values = [decrypt(email.value), decrypt(password.value), decrypt(userID.value)];
    const query = "SELECT * FROM users WHERE email = $1 AND password = $2 AND id = $3";
    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      client.release(),
        deleteCookies(cookieStore);

      return NextResponse.json({ error: "Invalid Cookie" }, { status: 400 });
    }

    if (result.rows[0].id === decrypt(userID.value)) {
      const user = {
        id: result.rows[0].id,
        email: result.rows[0].email,
        accepted: result.rows[0].accepted,
        applicationID: result.rows[0].application_id,
        name: result.rows[0].name,
      }
      client.release();

      return NextResponse.json({ message: "Cookie Validated", user: user }, { status: 200 });

    } else {
      client.release();
      cookieStore.delete('email');
      cookieStore.delete('password');
      cookieStore.delete('userID');

      return NextResponse.json({ error: "Invalid Cookie" }, { status: 400 });
    }
  } else {
    const values = [data.username, data.password];
    const query = "SELECT * FROM users WHERE email = $1 AND password = $2";
    const result = await client.query(query, values);

    let user;
    if (result.rows.length >= 1) {
      console.log("here")
      user = result.rows[0];

      cookieStore.set('email', encrypt(user.email));
      cookieStore.set('password', encrypt(user.password));
      cookieStore.set('userID', encrypt(user.id));
      client.release();
      return NextResponse.json({ message: "Session Created" }, { status: 200 });
    } else {
      client.release();
      return NextResponse.json({ error: "Invalid Credentials" }, { status: 400 });
    }
  }
}