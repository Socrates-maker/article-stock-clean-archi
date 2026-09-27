import { Money } from "../value-objects/money.value-object";
import { ValidationError } from "../errors/domain.error";

export class Article {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public authorId: string,
    public money: Money,
    public readonly createdAt: Date = new Date(),
  ) {}

  /** Règle d'autorisation portée par le domaine, pas par le contrôleur. */
  public isOwnedBy(userId: string): boolean {
    return this.authorId === userId;
  }

  /**
   * Mise à jour partielle : seuls les champs fournis sont modifiés.
   * Les invariants (titre non vide, prix positif) restent gardés ici.
   */
  public update(changes: {
    title?: string;
    description?: string;
    priceAmount?: number;
    currency?: string;
  }): void {
    if (changes.title !== undefined) {
      if (changes.title.trim().length === 0) {
        throw new ValidationError("Le titre ne peut pas être vide");
      }
      this.title = changes.title;
    }

    if (changes.description !== undefined) {
      if (changes.description.trim().length === 0) {
        throw new ValidationError("La description ne peut pas être vide");
      }
      this.description = changes.description;
    }

    if (changes.priceAmount !== undefined || changes.currency !== undefined) {
      // Money est immuable : on en reconstruit un, ce qui rejoue ses invariants.
      this.money = new Money(
        changes.priceAmount ?? this.money.amount,
        changes.currency ?? this.money.currency,
      );
    }
  }
}
