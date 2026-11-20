import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { User } from '@org/backend-decorators';
import type { LearningProgressResponse } from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { SaveLearningProgressDto } from './dto/save-learning-progress.dto';
import { LearningProgressLimitError } from './learning.errors';
import { LearningProgressService } from './learning-progress.service';

@Controller('learning/progress')
@UseGuards(AuthGuard(StrategyKey.JWT.USER))
export class LearningProgressController {
  constructor(private readonly progress: LearningProgressService) {}

  @Get()
  async list(@User() user: UserEntity): Promise<LearningProgressResponse> {
    return { slugs: await this.progress.list(user.id) };
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async save(@User() user: UserEntity, @Body() body: SaveLearningProgressDto): Promise<void> {
    try {
      await this.progress.save(user.id, body.slugs);
    } catch (error) {
      if (error instanceof LearningProgressLimitError) {
        throw new UnprocessableEntityException('Tài khoản đã lưu đủ số bài tối đa.');
      }
      throw error;
    }
  }
}
