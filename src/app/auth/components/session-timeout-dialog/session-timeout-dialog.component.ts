import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-session-timeout-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './session-timeout-dialog.component.html',
  styleUrl: './session-timeout-dialog.component.css',
})
export class SessionTimeoutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SessionTimeoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { seconds: number }
  ) {}
}
