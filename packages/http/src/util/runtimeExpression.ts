import { IHttpRequest, IHttpResponse } from '../types';
import * as Option from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import { get as _get } from 'lodash';
import { pointerToPath } from '@stoplight/json';

export function resolveRuntimeExpression(expr: string, request: IHttpRequest, response: IHttpResponse): Option.Option<unknown> {
  const parts = expr.split(/[.#]/);
  return pipe(
    pipe(
      parts[0],
      Option.fromPredicate(part => part === '$method'),
      Option.map(() => String(request.method)),
    ),
    Option.alt(() => pipe(
      parts[0],
      Option.fromPredicate(part => part === '$statusCode'),
      Option.map(() => String(response.statusCode)),
    )),
    Option.alt(() => pipe(
      parts[0],
      Option.fromPredicate(part => part === '$request'),
      Option.chain(() => pipe(
        pipe(
          parts[1],
          Option.fromPredicate(part => part === 'header'),
          Option.chain(() => Option.fromNullable(request.headers && request.headers[parts[2]])),
        ),
        Option.alt(() => pipe(
          parts[1],
          Option.fromPredicate(part => part === 'query'),
          Option.chain(() => Option.fromNullable(request.url.query && request.url.query[parts[2]])),
        )),
        Option.alt(() => pipe(
          parts[1],
          Option.fromPredicate(part => part === 'body'),
          Option.chain(() => Option.fromNullable(request.body && _get(request.body, pointerToPath('#' + parts[2])))),
        )),
      )),
    )),
    Option.alt(() => pipe(
      parts[0],
      Option.fromPredicate(part => part === '$response'),
      Option.chain(() => pipe(
        pipe(
          parts[1],
          Option.fromPredicate(part => part === 'header'),
          Option.chain(() => Option.fromNullable(response.headers && response.headers[parts[2]])),
        ),
      )),
      Option.alt(() => pipe(
        parts[1],
        Option.fromPredicate(part => part === 'body'),
        Option.chain(() => Option.fromNullable(response.body && _get(response.body, pointerToPath('#' + parts[2])))),
      )),
    )),
  );
}
