import { Article } from "../../../domain/entities/article.entity";
import { Money } from "../../../domain/value-objects/money.value-object";
import { ArticleModel } from "../../../generated/prisma/client";

export class ArticleMapper {
  /**
   * BDD -> Domaine (Reconstitution de l'entité et du Value Object Money)
   */
  static toDomain(raw: ArticleModel): Article {
    return new Article(
      raw.id,
      raw.title,
      raw.description,
      raw.authorId,
      new Money(raw.priceAmount, raw.priceCurrency), // Instanciation du Value Object
      raw.createdAt,
    );
  }

  /**
   * Domaine -> BDD (Extraction des propriétés du Value Object)
   */
  static toPersistence(article: Article): ArticleModel {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      priceAmount: article.money.amount, // Extrait la valeur numérique
      priceCurrency: article.money.currency, // Extrait la devise
      authorId: article.authorId,
      createdAt: article.createdAt,
      updatedAt: new Date(),
    };
  }
}
