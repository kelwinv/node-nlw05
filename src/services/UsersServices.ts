import { getCustomRepository, Repository } from "typeorm";
import { User } from "../entities/User";
import { UsersRepository } from "../repositories/UsersRepository";

class UsersServices {
  private usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = getCustomRepository(UsersRepository);
  }

  async findByEmail(email: string) {
    const userAlreadyExists = await this.usersRepository.findOne({ email });

    if (userAlreadyExists) {
      return userAlreadyExists;
    }
  }

  async create(email: string) {
    const userAlreadyExists = await this.findByEmail(email);

    if (userAlreadyExists) {
      return userAlreadyExists;
    }

    const users = this.usersRepository.create({
      email,
    });

    await this.usersRepository.save(users);

    return users;
  }
}

export { UsersServices };
