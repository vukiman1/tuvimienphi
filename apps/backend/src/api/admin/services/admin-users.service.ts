import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AdminUser } from '../models/admin-user.model';

@Injectable()
export class AdminUsersService {
  constructor(@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>) {}

  async findAll(): Promise<AdminUser[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => this.toAdminUser(user));
  }

  async ban(id: string): Promise<AdminUser> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.status = 'banned';
    const saved = await this.userRepo.save(user);
    return this.toAdminUser(saved);
  }

  private toAdminUser(user: UserEntity): AdminUser {
    const createdAt = user.createdAt.toISOString();
    return {
      id: user.id,
      displayName: user.displayName ?? '',
      email: user.email,
      avatarSeed: user.avatar ?? user.email,
      role: user.role,
      status: user.status,
      credits: user.balance,
      genCount: 0,
      createdAt,
      lastActiveAt: createdAt,
      genHistory: [],
    };
  }
}
