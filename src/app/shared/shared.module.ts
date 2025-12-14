import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BooleanToTextPipe } from './pipes/boolean-to-text.pipe';
import { UnionNombreApellidoPipe } from './pipes/union-nombre-apellido.pipe';
import { SizeTittleDirective } from './directives/size-tittle.directive';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddButtonComponent } from './components/button/add-button/add-button.component';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,

    // Standalone items
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
    FormsModule,
    DragDropModule,
    AddButtonComponent
  ],
  exports: [
    MaterialModule,
    ReactiveFormsModule,
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
    FormsModule,
    DragDropModule,
    AddButtonComponent
  ],
})
export class SharedModule {}
