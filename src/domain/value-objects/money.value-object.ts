export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = "EUR",
  ) {
    if (amount < 0) {
      throw new Error("Le prix ne peut pas être négatif");
    }
    if (!currency || currency.length !== 3) {
      throw new Error("Code de devise invalide (ex: EUR, XOF)");
    }
  }

  // Exemple de méthode métier propre au Value Object
  public add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error("Impossible d'additionner deux devises différentes");
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}
