
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ status: 200, description: 'Return all projects' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.projectsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Return the project' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async findOne(@Param('id') id: string) {
    const project = await this.projectsService.findOne(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
