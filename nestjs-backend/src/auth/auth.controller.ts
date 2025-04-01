
import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../common/decorators/public.decorator';
import { TokenDto } from './dto/token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.authService.register(registerDto);
      return {
        success: true,
        data: user,
        message: 'Registration successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  @Public()
  @Post('validate')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateToken(@Body() tokenDto: TokenDto) {
    try {
      const result = await this.authService.validateToken(tokenDto.token);
      
      if (!result) {
        return {
          success: false,
          error: 'Invalid token',
        };
      }
      
      return {
        success: true,
        data: result,
        message: 'Token is valid',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Token validation failed',
      };
    }
  }
}
