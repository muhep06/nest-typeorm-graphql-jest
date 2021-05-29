import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {NewUserInput} from './dto/new-user.input';
import {User} from './models/users.model';
import {UserRepository} from "./user.repository";
import {Connection} from "typeorm/index";
import {DeleteUserResponse} from "./dto/delete-response.dto";
import {
    paginate,
    Pagination,
    IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UsersService {

    private userRepository: UserRepository;

    constructor(
        private readonly connection: Connection
    ) {
        this.userRepository = this.connection.getCustomRepository(UserRepository);
    }

    async create(data: NewUserInput): Promise<User> {
        return await this.userRepository.createUser(data);
    }

    async findOneById(id: string): Promise<User> {
        return await this.userRepository.findOne(id);
    }

    async findOne(data: object): Promise<User> {
        return await this.userRepository.findOne(data);
    }

    async findAll(usersArgs: { skip: 0, take: 10 }): Promise<User[]> {
        return await this.userRepository.find(usersArgs);
    }

    async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
        const queryBuilder = this.userRepository.createQueryBuilder('c');
        queryBuilder.orderBy('c.id', 'DESC'); // Or whatever you need to do
        return paginate<User>(queryBuilder, options);
    }

    async remove(id: string): Promise<DeleteUserResponse> {

        try {
            const relatedUser = await this.userRepository.findOneOrFail(id)
            await this.userRepository.delete(id)
            return new DeleteUserResponse(relatedUser, 'DELETED', 200)
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