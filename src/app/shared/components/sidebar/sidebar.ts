// shared/components/sidebar/sidebar.ts
import { Component, signal, computed, inject, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlus, heroXMark } from '@ng-icons/heroicons/outline';
import { FormsModule } from '@angular/forms';
import { Card } from '../card/card';
import { Button } from '../button/button';
import { ProjectItem } from '../project-item/project-item';
import { UserProfile } from '../user-profile/user-profile';
import { LoginButton } from '../login-button/login-button';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    Card,
    Button,
    ProjectItem,
    UserProfile,
    LoginButton,
    NgIcon,
    FormsModule,
  ],
  providers: [provideIcons({ heroPlus, heroXMark })],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private authService = inject(AuthService);
  private projectService = inject(ProjectService);

  isAddingProject = signal(false);
  newProjectTitle = signal('');

  projects = this.projectService.allProjects;
  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => this.currentUser() !== null);

  generateTestDataClicked = output<void>();
  login = output<void>();
  logout = output<void>();

  selectProject(projectId: string): void {
    this.projectService.selectProject(projectId);
  }

  addProject(): void {
    if (!this.isLoggedIn()) {
      console.log('Please login to add projects');
      return;
    }
    this.isAddingProject.set(true);
  }

  handleAddProject(): void {
    const title = this.newProjectTitle().trim();

    if (title) {
      this.projectService.addProject(title);
      this.newProjectTitle.set('');
      this.isAddingProject.set(false);
    }
  }

  cancelAddProject(): void {
    this.newProjectTitle.set('');
    this.isAddingProject.set(false);
  }

  isProjectSelected(projectId: string): boolean {
    return this.projectService.isProjectSelected(projectId);
  }

  handleGenerateTestData(): void {
    this.generateTestDataClicked.emit();
  }

  handleLogin(): void {
    this.login.emit();
  }

  handleLogout(): void {
    this.logout.emit();
  }
}