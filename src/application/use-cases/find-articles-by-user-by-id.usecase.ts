import { ArticleRepositoryPort } from "../../domain/ports/article-repository.port";
import { PrismaClient } from "@prisma/client/extension";
import { Article } from "../../domain/entities/article.entity";
import { UserRepositoryPort } from "../../domain/ports/user-repository.port";

export class FindArticlesByUserByIdUsecase {
  constructor(
    private readonly articleRepository: ArticleRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(input: { authorId: string }): Promise<Article[]> {
    const author = await this.userRepository.findById(input.authorId);
    if (!author) {
      throw new Error("Auteur introuvable");
    }
    return await this.articleRepository.findByAuthorId(author.id);
  }
}
