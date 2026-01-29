// app.component.ts
import { Component, signal, inject, OnInit, OnDestroy, viewChild } from '@angular/core';
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
import { BoardService } from './core/services/board.service';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { Toast } from './shared/components/toast/toast';
import { AddCollaboratorModal } from './shared/components/add-collaborator-modal/add-collaborator-modal';
import { ToastService } from './core/services/toast.service';
import { computed, effect } from '@angular/core';

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
    NgIcon,
    Toast,
    AddCollaboratorModal,
  ],
  providers: [provideIcons({ heroPlus, heroBars3, heroXMark })],
})
export class App implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private kanbanService = inject(KanbanService);
  private projectService = inject(ProjectService);
  private boardService = inject(BoardService);
  private toastService = inject(ToastService);

  isMobileSidebarOpen = this.projectService.isMobileSidebarOpen;
  isLoadingProjects = signal(false);
  showAddCollaboratorModal = signal(false);

  columnsWithCards = this.kanbanService.columnsWithCards;
  selectedProject = this.projectService.selectedProject;

  selectedCardId = signal<string | null>(null);

  addCollaboratorModal = viewChild(AddCollaboratorModal);

  // Computed: проверяем является ли текущий пользователь owner'ом
  isCurrentUserOwner = computed(() => {
    const board = this.boardService.selectedBoard();
    const user = this.authService.currentUser();

    if (!board || !user) return false;

    return board.ownerId === user.uid;
  });

  // Computed collaborators from selected board
  collaborators = computed(() => {
    const board = this.boardService.selectedBoard();
    if (!board) return [];

    return board.collaborators.map((c) => ({
      id: c.userId,
      photoURL: c.photoURL || 'https://i.pravatar.cc/150?img=0',
      displayName: c.displayName || c.email.split('@')[0],
    }));
  });

  constructor() {
    this.authService.setOnLoginCallback(async () => {
      await this.loadProjectsAndBoard();
    });

    effect(async () => {
      const user = this.authService.currentUser();
      if (user) {
        await this.loadProjectsAndBoard();
      } else {
        this.clearAllData();
      }
    });
  }

  async ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      await this.loadProjectsAndBoard();
    }
  }

  ngOnDestroy() {
    this.kanbanService.cleanup();
  }

  private async loadProjectsAndBoard(): Promise<void> {
    this.isLoadingProjects.set(true);
    try {
      await this.projectService.loadProjects();

      const selectedBoardId = this.boardService.currentBoardId();
      if (selectedBoardId) {
        await this.kanbanService.loadBoard(selectedBoardId);
      } else {
        const boards = this.boardService.allBoards();
        if (boards.length > 0) {
          this.boardService.selectBoard(boards[0].id);
          await this.kanbanService.loadBoard(boards[0].id);
        }
      }
    } finally {
      this.isLoadingProjects.set(false);
    }
  }

  private clearAllData(): void {
    this.kanbanService.cleanup();
    this.boardService.clearBoards();
    this.selectedCardId.set(null);
    this.isMobileSidebarOpen.set(false);
    this.showAddCollaboratorModal.set(false);
  }

  toggleMobileSidebar(): void {
    this.projectService.toggleMobileSidebar();
  }

  handleInvite(): void {
    this.showAddCollaboratorModal.set(true);
  }

  async handleAddCollaborator(email: string): Promise<void> {
    const board = this.boardService.selectedBoard();
    if (!board) return;

    try {
      await this.boardService.addCollaborator(board.id, email, 'editor');
      this.toastService.success(`✅ ${email} added as collaborator!`);
      this.showAddCollaboratorModal.set(false);
      this.addCollaboratorModal()?.resetForm();
    } catch (error: any) {
      this.toastService.error(error.message || 'Failed to add collaborator');
      this.addCollaboratorModal()?.resetForm();
    }
  }

  closeAddCollaboratorModal(): void {
    this.showAddCollaboratorModal.set(false);
    this.addCollaboratorModal()?.resetForm();
  }

  async handleDeleteProject(): Promise<void> {
    const board = this.boardService.selectedBoard();
    if (!board) return;

    // Двойная проверка на owner
    if (board.ownerId !== this.authService.currentUser()?.uid) {
      this.toastService.error('Only the project owner can delete this project');
      return;
    }

    try {
      await this.projectService.deleteProject(board.id);
      this.toastService.success('Project deleted successfully');
    } catch (error: any) {
      this.toastService.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  }

  async handleColumnMenu(columnId: string): Promise<void> {
    await this.kanbanService.deleteColumn(columnId);
    this.toastService.success('Column deleted successfully');
  }

  async handleAddCard(columnId: string, cardTitle: string): Promise<void> {
    await this.kanbanService.addCard(columnId, cardTitle);
  }

  handleCardClick(cardId: string): void {
    this.selectedCardId.set(cardId);
  }

  async handleAddColumn(columnTitle: string): Promise<void> {
    const boardId = this.boardService.currentBoardId();
    if (!boardId) return;

    await this.kanbanService.addColumn(boardId, columnTitle);
  }

  async handleCardDrop(event: {
    previousColumnId: string;
    currentColumnId: string;
    previousIndex: number;
    currentIndex: number;
  }): Promise<void> {
    await this.kanbanService.moveCard(event);
  }

  async handleLogin(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      this.toastService.error('Login failed. Please try again.');
    }
  }

  async handleLogout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.toastService.info('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      this.toastService.error('Logout failed');
    }
  }

  closeModal(): void {
    this.selectedCardId.set(null);
  }
}
