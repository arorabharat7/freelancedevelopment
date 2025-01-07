import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'cookies';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

client = new MongoClient(uri);
clientPromise = client.connect();

export async function getSessionId(req: NextApiRequest, res: NextApiResponse): Promise<string | undefined> {
  const cookies = new Cookies(req, res);
  const sessionId = cookies.get('session-id');
  console.log(`Session ID retrieved from cookies: ${sessionId}`);
  return sessionId;
}

export async function setSessionId(req: NextApiRequest, res: NextApiResponse, sessionId: string): Promise<void> {
  const cookies = new Cookies(req, res);
  cookies.set('session-id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  console.log(`Session ID set in cookies: ${sessionId}`);
}

export async function getSessionIdAndCreateIfMissing(req: NextApiRequest, res: NextApiResponse): Promise<string> {
  let sessionId = await getSessionId(req, res);
  if (!sessionId) {
    sessionId = uuidv4();
    await setSessionId(req, res, sessionId);
  }
  console.log(`Session ID created: ${sessionId}`);
  return sessionId;
}

export async function get(req: NextApiRequest, res: NextApiResponse, key: string): Promise<any> {
  const sessionId = await getSessionId(req, res);
  console.log(`Session ID in get: ${sessionId}`);
  if (!sessionId) {
    console.error('No session ID found in get');
    return null;
  }
  const client = await clientPromise;
  const db = client.db();
  const session = await db.collection('sessions').findOne({ sessionId });
  console.log(`Session data for key ${key}: ${session ? session[key] : null}`);
  return session ? session[key] : null;
}

export async function set(req: NextApiRequest, res: NextApiResponse, key: string, value: any): Promise<void> {
  const sessionId = await getSessionIdAndCreateIfMissing(req, res);
  console.log(`Session ID in set: ${sessionId}`);
  const client = await clientPromise;
  const db = client.db();
  await db.collection('sessions').updateOne(
    { sessionId },
    { $set: { [key]: value, sessionId } },
    { upsert: true }
  );
  console.log(`Set data for key ${key}: ${value}`);
}

export async function destroy(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const sessionId = await getSessionId(req, res);
  if (!sessionId) {
    return;
  }
  const client = await clientPromise;
  const db = client.db();
  await db.collection('sessions').deleteOne({ sessionId });
  const cookies = new Cookies(req, res);
  cookies.set('session-id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });
  console.log(`Destroyed session with ID: ${sessionId}`);
}
