import { Field, ObjectType } from '@nestjs/graphql'
import { Type } from '@nestjs/common';


@ObjectType()
export class PageInfo {
    constructor(next ?: string, previous ?: string ) {
        this.hasNextPage = !(next.length === 0 || !next.trim());
        this.hasPrevPage = !(previous.length === 0 || !previous.trim());
    }

    @Field()
    hasNextPage: boolean

    @Field()
    hasPrevPage: boolean
}

export interface IPaginated<T> {
    nodes: T[]
    currentPage: Number
    totalCount: Number
    totalPages: Number
    pageInfo: PageInfo
}

export const Paginated = <T>(classRef: Type<T>): Type<IPaginated<T>> => {
    @ObjectType({ isAbstract: true })
    class PaginatedType {
        @Field(type => [classRef])
        nodes: T[]

        @Field()
        currentPage: Number

        @Field()
        totalCount: Number

        @Field()
        totalPages: Number

        @Field()
        pageInfo: PageInfo
    }

    return PaginatedType
}
