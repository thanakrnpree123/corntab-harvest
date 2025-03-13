
import { AppDataSource } from "../data-source";
import { Project } from "../entity/Project";

const projectRepository = AppDataSource.getRepository(Project);

export const ProjectController = {
  // ดึงข้อมูลโปรเจคทั้งหมด
  getAllProjects: async () => {
    try {
      const projects = await projectRepository.find({
        relations: ["jobs"],
      });
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: `Failed to fetch projects: ${error.message}` };
    }
  },

  // ดึงข้อมูลโปรเจคตาม ID
  getProjectById: async (id: string) => {
    try {
      const project = await projectRepository.findOne({
        where: { id },
        relations: ["jobs"],
      });

      if (!project) {
        return { success: false, error: "Project not found" };
      }

      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: `Failed to fetch project: ${error.message}` };
    }
  },

  // สร้างโปรเจคใหม่
  createProject: async (projectData: Partial<Project>) => {
    try {
      const newProject = projectRepository.create(projectData);
      const result = await projectRepository.save(newProject);
      return { success: true, data: result, message: "Project created successfully" };
    } catch (error) {
      return { success: false, error: `Failed to create project: ${error.message}` };
    }
  },

  // อัพเดทโปรเจค
  updateProject: async (id: string, projectData: Partial<Project>) => {
    try {
      const project = await projectRepository.findOneBy({ id });

      if (!project) {
        return { success: false, error: "Project not found" };
      }

      projectRepository.merge(project, projectData);
      const result = await projectRepository.save(project);
      return { success: true, data: result, message: "Project updated successfully" };
    } catch (error) {
      return { success: false, error: `Failed to update project: ${error.message}` };
    }
  },

  // ลบโปรเจค
  deleteProject: async (id: string) => {
    try {
      const result = await projectRepository.delete(id);

      if (result.affected === 0) {
        return { success: false, error: "Project not found" };
      }

      return { success: true, message: "Project deleted successfully" };
    } catch (error) {
      return { success: false, error: `Failed to delete project: ${error.message}` };
    }
  },
};
