import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {NewRecipeInput} from './dto/new-recipe.input';
import {Recipe} from './models/recipe.model';
import {RecipeRepository} from "./recipe.repository";
import {Connection} from "typeorm/index";
import {DeleteRecipeResponse} from "./dto/delete-response.dto";
import {
    paginate,
    Pagination,
    IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class RecipesService {

    private recipeRepository: RecipeRepository;

    constructor(
        private readonly connection: Connection
    ) {
        this.recipeRepository = this.connection.getCustomRepository(RecipeRepository);
    }

    async create(data: NewRecipeInput): Promise<Recipe> {
        return await this.recipeRepository.createRecipe(data);
    }

    async findOneById(id: string): Promise<Recipe> {
        return await this.recipeRepository.findOne(id);
    }

    async findAll(recipesArgs: { skip: 0, take: 10 }): Promise<Recipe[]> {
        return await this.recipeRepository.find(recipesArgs);
    }

    async paginate(options: IPaginationOptions): Promise<Pagination<Recipe>> {
        const queryBuilder = this.recipeRepository.createQueryBuilder('c');
        queryBuilder.orderBy('c.id', 'DESC'); // Or whatever you need to do


        return paginate<Recipe>(queryBuilder, options);
    }

    async remove(id: string): Promise<DeleteRecipeResponse> {

        try {
            const relatedRecipe = await this.recipeRepository.findOneOrFail(id)
            await this.recipeRepository.softDelete(id)
            return new DeleteRecipeResponse(relatedRecipe, 'DELETED', 200)
        } catch (e) {
            if (e.status === 401) {
                throw new UnauthorizedException(e.message)
            } else if (e.status === 404) {
                throw new NotFoundException(e.message)
            } else {
                throw new BadRequestException(e.message)
            }
        }
    }
}
