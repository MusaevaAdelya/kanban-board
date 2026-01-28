import { Component, signal, inject } from '@angular/core';
import { provideIcons, NgIcon } from '@ng-icons/core';
import { heroPlus, heroBars3, heroXMark } from '@ng-icons/heroicons/outline';
import { AuthService } from './core/services/auth.service';
import { BoardHeader } from './shared/components/board-header/board-header';
import { Column } from './shared/components/column/column';
import { AddColumnButton } from './shared/components/add-column-button/add-column-button';
import { DragScrollDirective } from './shared/directives/drag-scroll.directive';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { CardModal } from './shared/components/card-modal/card-modal';
import { KanbanService } from './core/services/kanban.service';
import { ProjectService } from './core/services/project.service';
import { Sidebar } from './shared/components/sidebar/sidebar';

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
    BoardHeader,
    Column,
    AddColumnButton,
    DragScrollDirective,
    CdkDropListGroup,
    CardModal,
    Sidebar,
    NgIcon
  ],
  providers: [provideIcons({ heroPlus, heroBars3, heroXMark })],
})
export class App {
  private authService = inject(AuthService);
  private kanbanService = inject(KanbanService);
  private projectService = inject(ProjectService);

  mockCollaborators = signal<Collaborator[]>([
    { id: '1', photoURL: 'https://i.pravatar.cc/150?img=1', displayName: 'Alice Johnson' },
    { id: '2', photoURL: 'https://i.pravatar.cc/150?img=2', displayName: 'Bob Smith' },
    { id: '3', photoURL: 'https://i.pravatar.cc/150?img=3', displayName: 'Carol White' },
    { id: '4', photoURL: 'https://i.pravatar.cc/150?img=4', displayName: 'David Brown' },
    { id: '5', photoURL: 'https://i.pravatar.cc/150?img=5', displayName: 'Eva Green' },
  ]);

  isMobileSidebarOpen = this.projectService.isMobileSidebarOpen;

  toggleMobileSidebar(): void {
    this.projectService.toggleMobileSidebar()
  }

  mockColumns = this.kanbanService.allColumns;
  selectedProject = this.projectService.selectedProject;

  selectedCardId = signal<string | null>(null);
  selectedColumnId = signal<string | null>(null);

  generateTestData(): void {
    console.log('Generate test data');
  }

  handleInvite(): void {
    console.log('Invite people clicked');
  }

  handleColumnMenu(columnId: string): void {
    this.kanbanService.deleteColumn(columnId);
  }

  handleAddCard(columnId: string, cardTitle: string): void {
    this.kanbanService.addCard(columnId, cardTitle);
  }

  handleCardClick(columnId: string, cardId: string): void {
    this.selectedColumnId.set(columnId);
    this.selectedCardId.set(cardId);
  }

  handleAddColumn(columnTitle: string): void {
    this.kanbanService.addColumn(columnTitle);
  }

  handleCardDrop(event: {
    previousColumnId: string;
    currentColumnId: string;
    previousIndex: number;
    currentIndex: number;
  }): void {
    this.kanbanService.moveCard(event);
  }

  async handleLogin(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async handleLogout(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  closeModal(): void {
    this.selectedCardId.set(null);
    this.selectedColumnId.set(null);
  }
}