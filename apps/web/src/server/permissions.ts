import { AuthorId, Game } from '@linemix/model';
import { assertNever } from '../../../../packages/model/src/util/assertNever';
export type Action = 'view' | 'draw' | 'publish' | 'delete';

export function can(authorId: AuthorId | undefined, game: Game, action: Action): boolean {
  const isOwner = authorId !== undefined && authorId === game.ownerId;

  switch (action) {
    case 'view':
      return game.visibility === 'public' || isOwner;
    case 'draw':
      return authorId !== undefined && (game.visibility === 'public' || game.visibility === 'open' || isOwner);
    case 'publish':
    case 'delete':
      return isOwner;
    default:
      return assertNever(action);
  }
}
