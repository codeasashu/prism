import * as Option from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/pipeable';
import * as Either from 'fp-ts/lib/Either';
import * as TaskEither from 'fp-ts/lib/TaskEither';

export function assertNone<A>(e: Option.Option<A>): asserts e is Option.None {
  pipe(
    e,
    Option.fold(
      () => ({}),
      a => {
        throw new Error('None expected, got a Some: ' + a);
      }
    )
  );
}

export function assertSome<A>(e: Option.Option<A>, onSome: (a: A) => void = () => {}): asserts e is Option.Some<A> {
  pipe(
    e,
    Option.fold(() => {
      throw new Error('Some expected, got a None');
    }, onSome)
  );
}

export function assertRight<L, A>(
  e: Either.Either<L, A>,
  onRight: (a: A) => void = () => {}
): asserts e is Either.Right<A> {
  pipe(
    e,
    Either.fold(l => {
      throw new Error('Right expected, got a Left: ' + l);
    }, onRight)
  );
}

export function assertLeft<L, A>(
  e: Either.Either<L, A>,
  onLeft: (a: L) => void = () => {}
): asserts e is Either.Left<L> {
  pipe(
    e,
    Either.fold(onLeft, a => {
      throw new Error('Left expected, got a Right: ' + a);
    })
  );
}

export async function assertResolvesRight<L, A>(e: TaskEither.TaskEither<L, A>, onRight: (a: A) => void = () => {}) {
  assertRight(await e(), onRight);
}

export async function assertResolvesLeft<L, A>(e: TaskEither.TaskEither<L, A>, onLeft: (a: L) => void = () => {}) {
  assertLeft(await e(), onLeft);
}
