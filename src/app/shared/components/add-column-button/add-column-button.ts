import { Component, output } from '@angular/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { provideIcons, NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-add-column-button',
  standalone: true,
  templateUrl:"./add-column-button.html",
  imports: [NgIcon],
  providers: [provideIcons({ heroPlus })]
})
export class AddColumnButton {
  clicked = output<void>();
}