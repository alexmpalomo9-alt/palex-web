import { NgModule } from '@angular/core';
import { MaterialModule } from './material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { BooleanToTextPipe } from './pipes/boolean-to-text.pipe';
import { UnionNombreApellidoPipe } from './pipes/union-nombre-apellido.pipe';
import { SizeTittleDirective } from './directives/size-tittle.directive';

@NgModule({
  imports: [
    MaterialModule,
    ReactiveFormsModule,

    // Standalone items
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
  ],
  exports: [
    MaterialModule,
    ReactiveFormsModule,
    BooleanToTextPipe,
    UnionNombreApellidoPipe,
    SizeTittleDirective,
  ],
})
export class SharedModule {}
