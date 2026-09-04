import { Test, TestingModule } from '@nestjs/testing';
import { CalendarType, Gender } from '@org/shared-contracts';
import { UserEntity } from '../user/entities/user.entity';
import { BirthInputDto } from './dto/birth-input.dto';
import { LaSoHistoryController } from './la-so-history.controller';
import { LaSoHistoryService } from './la-so-history.service';

const user = { id: 'user-1' } as UserEntity;
const OTHER_USER_ID = 'user-2';

const body: BirthInputDto = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};

describe('LaSoHistoryController', () => {
  let controller: LaSoHistoryController;
  let service: {
    list: jest.Mock;
    record: jest.Mock;
    sync: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      list: jest.fn().mockResolvedValue([]),
      record: jest.fn().mockResolvedValue({ birthKey: 'k' }),
      sync: jest.fn().mockResolvedValue([]),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaSoHistoryController],
      providers: [{ provide: LaSoHistoryService, useValue: service }],
    }).compile();

    controller = module.get(LaSoHistoryController);
  });

  it('wraps the list in the response envelope the client expects', async () => {
    service.list.mockResolvedValue([{ birthKey: 'k' }]);

    await expect(controller.list(user)).resolves.toEqual({ entries: [{ birthKey: 'k' }] });
  });

  it('records against the authenticated user, never a user named in the body', async () => {
    await controller.record(user, { ...body, userId: OTHER_USER_ID } as BirthInputDto);

    expect(service.record).toHaveBeenCalledWith('user-1', expect.anything());
  });

  it('syncs against the authenticated user', async () => {
    await controller.sync(user, { entries: [] });

    expect(service.sync).toHaveBeenCalledWith('user-1', []);
  });

  it('deletes against the authenticated user', async () => {
    await controller.remove(user, 'some-key');

    expect(service.remove).toHaveBeenCalledWith('user-1', 'some-key');
  });
});
