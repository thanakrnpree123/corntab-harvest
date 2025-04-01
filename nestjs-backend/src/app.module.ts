
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { JobsModule } from './jobs/jobs.module';
import { LogsModule } from './logs/logs.module';
import { AzureModule } from './azure/azure.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Environment and configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    
    // Database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: configService.get('DB_TYPE', 'mysql') as any,
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'crontab'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    
    // Task scheduling
    ScheduleModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    JobsModule,
    LogsModule,
    AzureModule,
    HealthModule,
  ],
  providers: [
    // Global JWT authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
