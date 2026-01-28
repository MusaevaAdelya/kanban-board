import { Component, signal, computed, inject } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroPlus, heroXMark } from '@ng-icons/heroicons/outline';
import { Card } from './shared/components/card/card';
import { Button } from './shared/components/button/button';
import { ProjectItem } from './shared/components/project-item/project-item';
import { UserProfile } from './shared/components/user-profile/user-profile';
import { LoginButton } from './shared/components/login-button/login-button';
import { AuthService } from './core/services/auth.service';
import { BoardHeader } from './shared/components/board-header/board-header';
import { Column } from './shared/components/column/column';
import { AddColumnButton } from './shared/components/add-column-button/add-column-button';
import { DragScrollDirective } from './shared/directives/drag-scroll.directive';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CardModal } from './shared/components/card-modal/card-modal';
import { KanbanService } from './core/services/kanban.service';
import { FormsModule } from '@angular/forms';

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

interface Label {
  id: string;
  name: string;
  color: string;
}

interface KanbanCard {
  id: string;
  title: string;
  labels: Label[];
  assignee?: {
    photoURL: string;
    displayName: string;
  };
  commentsCount: number;
  attachmentsCount: number;
}

interface BoardColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
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
    BoardHeader,
    Column,
    AddColumnButton,
    DragScrollDirective,
    CdkDropListGroup,
    CardModal,
    FormsModule,
    NgIcon,
  ],
  providers: [provideIcons({ heroPlus, heroXMark })],
})
export class App {
  private authService = inject(AuthService);
  private kanbanService = inject(KanbanService);

  protected readonly title = signal('kanban-board');

  projects = signal<Project[]>([
    { id: '1', title: 'Health Web App', owner: 'Adelya Musaeva' },
    { id: '2', title: 'Education Web App', owner: 'Adelya Musaeva' },
    { id: '3', title: 'Finance Mobile App', owner: 'Adelya Musaeva' },
  ]);

  mockCollaborators = signal<Collaborator[]>([
    { id: '1', photoURL: 'https://i.pravatar.cc/150?img=1', displayName: 'Alice Johnson' },
    { id: '2', photoURL: 'https://i.pravatar.cc/150?img=2', displayName: 'Bob Smith' },
    { id: '3', photoURL: 'https://i.pravatar.cc/150?img=3', displayName: 'Carol White' },
    { id: '4', photoURL: 'https://i.pravatar.cc/150?img=4', displayName: 'David Brown' },
    { id: '5', photoURL: 'https://i.pravatar.cc/150?img=5', displayName: 'Eva Green' },
  ]);

  isAddingProject = signal(false);
  newProjectTitle = signal('');
  newProjectOwner = signal('');

  mockColumns = this.kanbanService.allColumns;

  selectedProjectId = signal<string | null>('1');

  selectedProject = computed(() => {
    const projectId = this.selectedProjectId();
    return this.projects().find((p) => p.id === projectId);
  });

  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => this.currentUser() !== null);

  selectedCardId = signal<string | null>(null);
  selectedColumnId = signal<string | null>(null);

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  addProject() {
    // Проверяем, залогинен ли пользователь
    if (!this.isLoggedIn()) {
      console.log('Please login to add projects');
      return;
    }
    this.isAddingProject.set(true);
  }

  handleAddProject() {
    const title = this.newProjectTitle().trim();
    const user = this.currentUser();

    // Двойная проверка: есть ли название и залогинен ли пользователь
    if (title && user) {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title,
        owner: user.displayName || user.email || 'Unknown User', // Используем displayName или email
      };

      this.projects.update((projects) => [...projects, newProject]);
      this.selectedProjectId.set(newProject.id);

      // Очистка формы
      this.newProjectTitle.set('');
      this.isAddingProject.set(false);
    }
  }

  cancelAddProject() {
    this.newProjectTitle.set('');
    this.isAddingProject.set(false);
  }

  generateTestData() {
    console.log('Generate test data');
  }

  handleInvite() {
    console.log('Invite people clicked');
  }

  handleColumnMenu(columnId: string) {
    this.kanbanService.deleteColumn(columnId);
  }

  handleAddCard(columnId: string, cardTitle: string) {
    this.kanbanService.addCard(columnId, cardTitle);
  }

  handleCardClick(columnId: string, cardId: string): void {
    this.selectedColumnId.set(columnId);
    this.selectedCardId.set(cardId);
  }

  handleAddColumn(columnTitle: string) {
    this.kanbanService.addColumn(columnTitle);
  }

  handleCardDrop(event: {
    previousColumnId: string;
    currentColumnId: string;
    previousIndex: number;
    currentIndex: number;
  }) {
    this.kanbanService.moveCard(event);
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

  closeModal(): void {
    this.selectedCardId.set(null);
    this.selectedColumnId.set(null);
  }
}
