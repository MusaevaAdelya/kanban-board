import { Component, signal, computed, inject } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { Card } from './shared/components/card/card';
import { Button } from './shared/components/button/button';
import { ProjectItem } from './shared/components/project-item/project-item';
import { UserProfile } from './shared/components/user-profile/user-profile';
import { LoginButton } from './shared/components/login-button/login-button';
import { AuthService } from './core/services/auth.service';
import { BoardHeader } from './shared/components/board-header/board-header';
import { Column } from './shared/components/column/column';
import { AddColumnButton } from './shared/components/add-column-button/add-column-button';
import { DragScrollDirective } from "./shared/directives/drag-scroll.directive";

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
    DragScrollDirective
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

  mockCollaborators = signal<Collaborator[]>([
    { id: '1', photoURL: 'https://i.pravatar.cc/150?img=1', displayName: 'Alice Johnson' },
    { id: '2', photoURL: 'https://i.pravatar.cc/150?img=2', displayName: 'Bob Smith' },
    { id: '3', photoURL: 'https://i.pravatar.cc/150?img=3', displayName: 'Carol White' },
    { id: '4', photoURL: 'https://i.pravatar.cc/150?img=4', displayName: 'David Brown' },
    { id: '5', photoURL: 'https://i.pravatar.cc/150?img=5', displayName: 'Eva Green' }
  ]);

  // Mock board data
  mockColumns = signal<BoardColumn[]>([
    {
      id: '1',
      title: 'To Do',
      color: 'bg-scarlet-rush',
      cards: [
        {
          id: '1',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=1',
            displayName: 'Alice'
          },
          commentsCount: 3,
          attachmentsCount: 2
        },
        {
          id: '2',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=2',
            displayName: 'Bob'
          },
          commentsCount: 1,
          attachmentsCount: 2
        }
      ]
    },
    {
      id: '2',
      title: 'In Progress',
      color: 'bg-scarlet-rush',
      cards: [
        {
          id: '3',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=3',
            displayName: 'Carol'
          },
          commentsCount: 3,
          attachmentsCount: 2
        },
        {
          id: '4',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          commentsCount: 1,
          attachmentsCount: 2
        },
        {
          id: '5',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=4',
            displayName: 'David'
          },
          commentsCount: 3,
          attachmentsCount: 2
        },
        {
          id: '20',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=4',
            displayName: 'David'
          },
          commentsCount: 3,
          attachmentsCount: 2
        }  
      ]
    },
    {
      id: '3',
      title: 'Done',
      color: 'bg-scarlet-rush',
      cards: [
        {
          id: '6',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          assignee: {
            photoURL: 'https://i.pravatar.cc/150?img=5',
            displayName: 'Eva'
          },
          commentsCount: 3,
          attachmentsCount: 2
        },
        {
          id: '7',
          title: 'Design Notification Banner',
          labels: [
            { id: '1', name: 'Design', color: '#F197FF' },
            { id: '2', name: 'Research', color: '#BC98FD' }
          ],
          commentsCount: 3,
          attachmentsCount: 2
        }
      ]
    }
  ]);

  selectedProjectId = signal<string | null>('1');

  selectedProject = computed(() => {
    const projectId = this.selectedProjectId();
    return this.projects().find(p => p.id === projectId);
  });

  currentUser = this.authService.currentUser;
  isLoggedIn = computed(() => this.currentUser() !== null);

  selectProject(projectId: string) {
    this.selectedProjectId.set(projectId);
  }

  addProject() {
    console.log('Add new project');
  }

  generateTestData() {
    console.log('Generate test data');
  }

  handleInvite() {
    console.log('Invite people clicked');
  }

  handleColumnMenu(columnId: string) {
    console.log('Column menu clicked:', columnId);
  }

  handleAddCard(columnId: string) {
    console.log('Add card to column:', columnId);
  }

  handleCardClick(cardId: string) {
    console.log('Card clicked:', cardId);
  }

  handleAddColumn() {
    console.log('Add new column');
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