import { NextApiRequest, NextApiResponse } from 'next';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const handleGetRequest = (req: NextApiRequest, res: NextApiResponse) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // console.log('Full query object:', req.query);
  // console.log('VERIFY_TOKEN from env:', VERIFY_TOKEN);
  // console.log('Received token:', token);

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Verification token mismatch');
  }
};

const handlePostRequest = (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;

  if (body.object) {
    console.log('Webhook received:', body);

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.status(404).send('Not Found');
  }
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    handlePostRequest(req, res);
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
