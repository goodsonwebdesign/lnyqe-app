import { Component, input } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recent-messages-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-messages-widget.component.html',
  styleUrls: ['./recent-messages-widget.component.scss']
})
export class RecentMessagesWidgetComponent {
  messages = input.required<Message[]>();
}
