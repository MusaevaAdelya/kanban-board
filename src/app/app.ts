import { Component, signal, computed, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { Card } from './shared/components/card/card';
import { Button } from './shared/components/button/button';
import { ProjectItem } from './shared/components/project-item/project-item';
import { UserProfile } from './shared/components/user-profile/user-profile';
import { LoginButton } from './shared/components/login-button/login-button';
import { AuthService } from './core/services/auth.service';
import { BoardHeader } from './shared/components/board-header/board-header';

interface Project {
  id: string;
  title: string;
  owner: string;
}

interface Collaborator {
  id: string;
  photoURL: string;
  displayName: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    Card,
    Button,
    ProjectItem,
    UserProfile,
    LoginButton,
    BoardHeader
  ],
  providers: [provideIcons({ heroPlus })]
})
export class App {
  private authService = inject(AuthService);

  protected readonly title = signal('kanban-board');

  projects = signal<Project[]>([
    { id: '1', title: 'Health Web App', owner: 'Adelya Musaeva' },
    { id: '2', title: 'Education Web App', owner: 'Adelya Musaeva' },
    { id: '3', title: 'Finance Mobile App', owner: 'Adelya Musaeva' }
  ]);

  // Mock collaborators data
  mockCollaborators = signal<Collaborator[]>([
    { id: '1', photoURL: 'https://i.pravatar.cc/150?img=1', displayName: 'Alice Johnson' },
    { id: '2', photoURL: 'https://i.pravatar.cc/150?img=2', displayName: 'Bob Smith' },
    { id: '3', photoURL: 'https://i.pravatar.cc/150?img=3', displayName: 'Carol White' },
    { id: '4', photoURL: 'https://i.pravatar.cc/150?img=4', displayName: 'David Brown' },
    { id: '5', photoURL: 'https://i.pravatar.cc/150?img=5', displayName: 'Eva Green' }
  ]);

  selectedProjectId = signal<string | null>('1');

  selectedProject = computed(() => {
    const projectId = this.selectedProjectId();
    return this.projects().find(p => p.id === projectId);
  });

  // Auth state
  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => this.currentUser() !== null);

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  addProject() {
    console.log('Add new project');
    // TODO: Реализовать позже
  }

  generateTestData() {
    console.log('Generate test data');
    // TODO: Реализовать позже
  }

  handleInvite() {
    console.log('Invite people clicked');
    // TODO: Открыть модалку с инвайтом
  }

  async handleLogin() {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async handleLogout() {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  isProjectSelected(projectId: string): boolean {
    return this.selectedProjectId() === projectId;
  }
}