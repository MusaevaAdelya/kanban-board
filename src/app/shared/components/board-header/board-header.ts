import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroUserPlusSolid } from '@ng-icons/heroicons/solid';

interface Collaborator {
  id: string;
  photoURL: string;
  displayName: string;
}

@Component({
  selector: 'app-board-header',
  standalone: true,
  imports: [NgIcon],
  providers: [provideIcons({ heroUserPlusSolid })],
  templateUrl: './board-header.html'
})
export class BoardHeader {
  title = input.required<string>();
  owner = input.required<string>();
  collaborators = input<Collaborator[]>([]);
  
  inviteClicked = output<void>();
}