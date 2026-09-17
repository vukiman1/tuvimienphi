import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AdminRoleGuard } from '../../../graphql/admin-role.guard';
import { GqlAuthGuard } from '../../../graphql/gql-auth.guard';
import { CreatePostInput, UpdatePostInput } from '../inputs/blog-post.input';
import { BlogPost } from '../models/blog-post.model';
import { BlogService } from '../services/blog.service';

@Resolver(() => BlogPost)
export class BlogResolver {
  constructor(private readonly service: BlogService) {}

  @Query(() => [BlogPost])
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  blog(): Promise<BlogPost[]> {
    return this.service.findAll();
  }

  @Mutation(() => BlogPost)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  createPost(@Args('input') input: CreatePostInput): Promise<BlogPost> {
    return this.service.create(input);
  }

  @Mutation(() => BlogPost)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  updatePost(@Args('id') id: string, @Args('input') input: UpdatePostInput): Promise<BlogPost> {
    return this.service.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, AdminRoleGuard)
  deletePost(@Args('id') id: string): Promise<boolean> {
    return this.service.remove(id);
  }
}
