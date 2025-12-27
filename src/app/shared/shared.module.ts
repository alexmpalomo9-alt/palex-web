import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SizeTittleDirective } from './directives/size-tittle.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    // Standalone items
    SizeTittleDirective,
    FormsModule,
    DragDropModule,
  ],
  exports: [
    MaterialModule,
    ReactiveFormsModule,
    SizeTittleDirective,
    FormsModule,
    DragDropModule,
  ], 
})
export class SharedModule {}
