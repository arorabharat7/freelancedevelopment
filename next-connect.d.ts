// next-connect.d.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { RequestHandler } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

declare module 'next-connect' {
  import { NextApiRequest, NextApiResponse } from 'next';

  interface Options<Req, Res> {
    onError?: (err: any, req: Req, res: Res, next: (err?: any) => void) => void;
    onNoMatch?: (req: Req, res: Res) => void;
  }

  interface Middleware<Req, Res> {
    (req: Req, res: Res, next: (err?: any) => void): void;
  }

  export default function nextConnect<Req = NextApiRequest, Res = NextApiResponse>(
    options?: Options<Req, Res>
  ): NextConnect<Req, Res>;

  interface NextConnect<Req, Res> {
    use(...fn: Array<Middleware<Req, Res> | RequestHandler>): this;
    handle: (req: IncomingMessage, res: ServerResponse) => void;
    get: (fn: Middleware<Req, Res>) => this;
    post: (fn: Middleware<Req, Res>) => this;
    put: (fn: Middleware<Req, Res>) => this;
    delete: (fn: Middleware<Req, Res>) => this;
    patch: (fn: Middleware<Req, Res>) => this;
    options: (fn: Middleware<Req, Res>) => this;
    head: (fn: Middleware<Req, Res>) => this;
  }
}
