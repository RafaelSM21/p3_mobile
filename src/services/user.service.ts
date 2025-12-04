import { prisma } from "../db";

export class UserService {
  async listUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
    return users;
  }

  async getUser(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    });
    return user;
  }

  async deleteUser(id: number) {
    await prisma.user.delete({ where: { id } });
    return;
  }
  async updateUser(id: number, data: { name?: string; email?: string }) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true }
    });
    return updatedUser;
  }
}
