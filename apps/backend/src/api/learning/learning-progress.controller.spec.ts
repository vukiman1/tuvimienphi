import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UnprocessableEntityException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyKey } from '@org/backend-constants';
import { UserEntity } from '../user/entities/user.entity';
import { SaveLearningProgressDto } from './dto/save-learning-progress.dto';
import { LearningProgressLimitError } from './learning.errors';
import { LearningProgressController } from './learning-progress.controller';
import { LearningProgressService } from './learning-progress.service';

const user = Object.assign(new UserEntity(), { id: 'user-1' });

function controllerWith(service: { list: jest.Mock; save: jest.Mock }): LearningProgressController {
  return new LearningProgressController(service as unknown as LearningProgressService);
}

describe('LearningProgressController', () => {
  it('answers only a signed-in reader', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, LearningProgressController)).toEqual([
      AuthGuard(StrategyKey.JWT.USER),
    ]);
  });

  it('wraps the slugs in the response the client reads', async () => {
    const service = { list: jest.fn().mockResolvedValue(['tu-vi-la-gi']), save: jest.fn() };

    await expect(controllerWith(service).list(user)).resolves.toEqual({ slugs: ['tu-vi-la-gi'] });
  });

  it('saves for the authenticated reader, never one named in the body', async () => {
    const service = { list: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
    const body = Object.assign(new SaveLearningProgressDto(), {
      slugs: ['a'],
      userId: 'user-2',
    });

    await controllerWith(service).save(user, body);

    expect(service.save).toHaveBeenCalledWith('user-1', ['a']);
  });

  it('answers 422 when the account is full', async () => {
    const service = {
      list: jest.fn(),
      save: jest.fn().mockRejectedValue(new LearningProgressLimitError('user-1', 200)),
    };
    const body = Object.assign(new SaveLearningProgressDto(), { slugs: ['a'] });

    await expect(controllerWith(service).save(user, body)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('lets any other failure through', async () => {
    const failure = new Error('db down');
    const service = { list: jest.fn(), save: jest.fn().mockRejectedValue(failure) };
    const body = Object.assign(new SaveLearningProgressDto(), { slugs: ['a'] });

    await expect(controllerWith(service).save(user, body)).rejects.toBe(failure);
  });
});
