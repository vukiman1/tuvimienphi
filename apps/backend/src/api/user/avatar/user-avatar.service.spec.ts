import { AvatarMimeType } from '@org/shared-contracts';
import { UserEntity } from '../entities/user.entity';
import {
  AvatarUploadUnavailableException,
  UnsupportedAvatarTypeException,
} from './avatar.exceptions';
import { UserAvatarService } from './user-avatar.service';

const PUBLIC_URL = 'https://media.example.com';
const PNG_IMAGE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

describe('UserAvatarService.replace', () => {
  let objectStorage: {
    isConfigured: jest.Mock;
    putPublicObject: jest.Mock;
    deleteObject: jest.Mock;
    keyFromPublicUrl: jest.Mock;
  };
  let userService: { update: jest.Mock };
  let service: UserAvatarService;

  beforeEach(() => {
    objectStorage = {
      isConfigured: jest.fn().mockReturnValue(true),
      putPublicObject: jest.fn(({ key }) => Promise.resolve(`${PUBLIC_URL}/${key}`)),
      deleteObject: jest.fn().mockResolvedValue(undefined),
      keyFromPublicUrl: jest.fn((url: string) =>
        url.startsWith(`${PUBLIC_URL}/`) ? url.slice(PUBLIC_URL.length + 1) : null,
      ),
    };
    userService = { update: jest.fn((user, patch) => Promise.resolve({ ...user, ...patch })) };
    service = new UserAvatarService(userService as never, objectStorage as never);
  });

  function userWithAvatar(avatar: string | null): UserEntity {
    return { id: 'user-1', avatar } as UserEntity;
  }

  it('stores the image under the user and saves its public url', async () => {
    const result = await service.replace(userWithAvatar(null), PNG_IMAGE);

    expect(objectStorage.putPublicObject).toHaveBeenCalledWith({
      key: expect.stringMatching(/^avatars\/user-1\/[0-9a-f-]{36}\.png$/),
      body: PNG_IMAGE,
      contentType: AvatarMimeType.Png,
    });
    expect(result.avatar).toMatch(new RegExp(`^${PUBLIC_URL}/avatars/user-1/`));
    expect(userService.update).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1' }), {
      avatar: result.avatar,
    });
  });

  it('deletes the avatar it uploaded before', async () => {
    await service.replace(userWithAvatar(`${PUBLIC_URL}/avatars/user-1/old.png`), PNG_IMAGE);

    expect(objectStorage.deleteObject).toHaveBeenCalledWith('avatars/user-1/old.png');
  });

  it('leaves a Google profile picture alone, since it is not ours to delete', async () => {
    await service.replace(userWithAvatar('https://lh3.googleusercontent.com/a/pic'), PNG_IMAGE);

    expect(objectStorage.deleteObject).not.toHaveBeenCalled();
  });

  it('still succeeds when the old avatar cannot be deleted', async () => {
    objectStorage.deleteObject.mockRejectedValue(new Error('network down'));

    const result = await service.replace(
      userWithAvatar(`${PUBLIC_URL}/avatars/user-1/old.png`),
      PNG_IMAGE,
    );

    expect(result.avatar).toMatch(/\.png$/);
  });

  it('refuses a file that is not a supported image', async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');

    await expect(service.replace(userWithAvatar(null), svg)).rejects.toBeInstanceOf(
      UnsupportedAvatarTypeException,
    );
    expect(objectStorage.putPublicObject).not.toHaveBeenCalled();
  });

  it('reports uploads as unavailable when storage is not configured', async () => {
    objectStorage.isConfigured.mockReturnValue(false);

    await expect(service.replace(userWithAvatar(null), PNG_IMAGE)).rejects.toBeInstanceOf(
      AvatarUploadUnavailableException,
    );
  });
});
