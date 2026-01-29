// shared/components/board-header/board-header.ts
import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUserPlusSolid, heroTrashSolid } from '@ng-icons/heroicons/solid';

interface Collaborator {
  id: string;
  photoURL: string;
  displayName: string;
}

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ heroUserPlusSolid, heroTrashSolid })],
  templateUrl: './board-header.html'
})
export class BoardHeader {
  title = input.required<string>();
  owner = input.required<string>();
  collaborators = input<Collaborator[]>([]);
  isOwner = input<boolean>(false);
  
  inviteClicked = output<void>();
  deleteClicked = output<void>();
}