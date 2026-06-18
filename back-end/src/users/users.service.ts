import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(
    email: string,
    selectPassword = false,
  ): Promise<User | null> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (selectPassword) {
      queryBuilder.addSelect('user.password');
    }

    return queryBuilder.getOne();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
}
