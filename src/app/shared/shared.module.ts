import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BooleanToTextPipe } from './pipes/boolean-to-text.pipe';
import { UnionNombreApellidoPipe } from './pipes/union-nombre-apellido.pipe';
import { SizeTittleDirective } from './directives/size-tittle.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,

    // Standalone items
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
    FormsModule,
    DragDropModule
  ],
  exports: [
    MaterialModule,
    ReactiveFormsModule,
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
    FormsModule,
    DragDropModule,
  ],
})
export class SharedModule {}
