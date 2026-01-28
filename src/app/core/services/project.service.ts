import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface Project {
  id: string;
  title: string;
  owner: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private authService = inject(AuthService);

  private projects = signal<Project[]>([
    { id: '1', title: 'Health Web App', owner: 'Adelya Musaeva' },
    { id: '2', title: 'Education Web App', owner: 'Adelya Musaeva' },
    { id: '3', title: 'Finance Mobile App', owner: 'Adelya Musaeva' },
  ]);

  private selectedProjectId = signal<string | null>('1');

  isMobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(value => !value);
  }

  readonly allProjects = this.projects.asReadonly();
  readonly currentProjectId = this.selectedProjectId.asReadonly();

  readonly selectedProject = computed(() => {
    const projectId = this.selectedProjectId();
    return this.projects().find((p) => p.id === projectId);
  });

  selectProject(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.isMobileSidebarOpen.set(false);
  }

  addProject(title: string): void {
    const user = this.authService.currentUser();
    
    if (!user) {
      console.warn('User must be logged in to add projects');
      return;
    }

    const newProject: Project = {
      id: `project-${Date.now()}`,
      title,
      owner: user.displayName || user.email || 'Unknown User',
    };

    this.projects.update((projects) => [...projects, newProject]);
    this.selectedProjectId.set(newProject.id);
  }

  deleteProject(projectId: string): void {
    const projects = this.projects();
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    this.projects.set(updatedProjects);

    // Если удален выбранный проект, выбираем первый доступный
    if (this.selectedProjectId() === projectId) {
      this.selectedProjectId.set(updatedProjects[0]?.id || null);
    }
  }

  isProjectSelected(projectId: string): boolean {
    return this.selectedProjectId() === projectId;
  }
}