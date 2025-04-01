
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { RoleEntity } from './entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Get user role (or create it if it doesn't exist)
    let userRole = await this.roleRepository.findOne({
      where: { name: 'user' },
    });

    if (!userRole) {
      userRole = this.roleRepository.create({
        name: 'user',
        permissions: ['view', 'create', 'update'],
      });
      await this.roleRepository.save(userRole);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      roleId: userRole.id,
    });

    const savedUser = await this.userRepository.save(user);
    const { password: _, ...result } = savedUser;
    return result;
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) {
        return null;
      }

      const { password: _, ...result } = user;
      return { user: result, isValid: true };
    } catch (error) {
      return null;
    }
  }
}
