import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowRightStartOnRectangle } from '@ng-icons/heroicons/outline';
import { Card} from '../card/card';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NgIcon, Card],
  providers: [provideIcons({ heroArrowRightStartOnRectangle })],
  templateUrl: "./user-profile.html",
  styleUrl:"user-profile.scss"
})
export class UserProfile {
  displayName = input.required<string>();
  email = input.required<string>();
  photoURL = input.required<string>();
  
  logout = output<void>();
}