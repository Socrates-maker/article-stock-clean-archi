import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { Article } from "../../domain/entities/article.entity";
import { Money } from "../../domain/value-objects/money.value-object";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";

export interface CreateArticleDTO {
  title: string;
  description: string;
  priceAmount: number;
  currency?: string;
  authorId: string;
}

export class SaveArticleUseCase {
  constructor(
    private readonly articleRepository: ArticleRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: CreateArticleDTO): Promise<Article> {
    const author = await this.userRepository.findById(input.authorId);
    if (!author) {
      throw new Error("Auteur introuvable");
    }
    const price = new Money(input.priceAmount, input.currency);
    const article = new Article(
      crypto.randomUUID(),
      input.title,
      input.description,
      input.authorId,
      price,
    );
    await this.articleRepository.save(article);
    return article;
  }
}
