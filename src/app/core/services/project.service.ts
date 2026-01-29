// core/services/project.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { BoardService } from './board.service';
import { KanbanService } from './kanban.service';

export interface Project {
  id: string;
  title: string;
  owner: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private boardService = inject(BoardService);
  private kanbanService = inject(KanbanService);

  isMobileSidebarOpen = signal(false);

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update((value) => !value);
  }

  // Proxy to BoardService
  readonly allProjects = computed(() => {
    return this.boardService.allBoards().map(board => ({
      id: board.id,
      title: board.title,
      owner: board.ownerDisplayName || board.ownerEmail
    }));
  });

  readonly currentProjectId = this.boardService.currentBoardId;

  readonly selectedProject = computed(() => {
    const board = this.boardService.selectedBoard();
    if (!board) return null;
    return {
      id: board.id,
      title: board.title,
      owner: board.ownerDisplayName || board.ownerEmail,
      collaborators: board.collaborators
    };
  });

  async selectProject(projectId: string): Promise<void> {
    this.boardService.selectBoard(projectId);
    await this.kanbanService.loadBoard(projectId);
    this.isMobileSidebarOpen.set(false);
  }

  async addProject(title: string): Promise<void> {
    const boardId = await this.boardService.createBoard(title);
    if (boardId) {
      // Доска уже выбрана и загружена в createBoard
      await this.kanbanService.loadBoard(boardId);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.boardService.deleteBoard(projectId);
  }

  isProjectSelected(projectId: string): boolean {
    return this.boardService.currentBoardId() === projectId;
  }

  async loadProjects(): Promise<void> {
    await this.boardService.loadBoards();
  }
}