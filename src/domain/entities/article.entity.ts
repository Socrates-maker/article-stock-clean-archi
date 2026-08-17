import { Money } from "../value-objects/money.value-object";

export class Article {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string,
    public authorId: string,
    public readonly money: Money,
    public readonly createdAt: Date = new Date(),
  ) {}
}
