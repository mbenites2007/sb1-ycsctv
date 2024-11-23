import { prisma } from '../lib/prisma';
import { hash, compare } from 'bcryptjs';

export class AuthService {
  static async createUser(username: string, email: string, password: string, accessLevel: string = 'standard') {
    const hashedPassword = await hash(password, 10);
    
    return prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        accessLevel
      }
    });
  }

  static async validateUser(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}