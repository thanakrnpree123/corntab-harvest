
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepository: Repository<ProjectEntity>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectEntity> {
    const project = this.projectRepository.create(createProjectDto);
    return await this.projectRepository.save(project);
  }

  async findAll(paginationDto: PaginationDto): Promise<[ProjectEntity[], number]> {
    return await this.projectRepository.findAndCount({
      skip: paginationDto.skip,
      take: paginationDto.limit,
      relations: ['jobs'],
    });
  }

  async findOne(id: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['jobs'],
    });
    
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<ProjectEntity> {
    const project = await this.findOne(id);
    
    // Update project properties
    Object.assign(project, updateProjectDto);
    
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}
