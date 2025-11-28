import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { User } from '../../model/user.model';
import { AuthService } from '../../../auth/services/auth.service';
import { SharedModule } from '../../../shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { matFormFieldAnimations, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadService } from '../../../shared/services/image-upload/image-upload.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [SharedModule,MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  loading = true;
  uploading = false;
  saving = false;
  imagePreview: string | null = null;
  currentUser!: User;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private imageUpload: ImageUploadService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) return;

      this.currentUser = user;
      this.imagePreview = user.photoURL || null;

      this.profileForm = this.fb.group({
        name: [user.name || ''],
        lastname: [user.lastname || ''],
        email: [{ value: user.email, disabled: true }],
        birthdate: [user.birthdate || null],
        address: [user.address || ''],
        phone: [user.phone || '']
      });

      this.loading = false;
    });
  }

  async onPhotoSelect(event: any): Promise<void> {
    const file: File = event.target.files?.[0];
    if (!file) return;

    this.uploading = true;

    try {
      const localPreview = URL.createObjectURL(file);
      this.imagePreview = localPreview;

      const path = `users/${this.currentUser.uid}/profile.jpg`;
      const downloadURL = await this.imageUpload.uploadImage(file, path);

      await this.userService.updateUser(this.currentUser.uid, { photoURL: downloadURL });

      this.snack.open('Imagen subida correctamente', 'Cerrar', { duration: 3000 });
    } catch (err) {
      console.error(err);
      this.snack.open('Error al subir la imagen', 'Cerrar', { duration: 3000 });
    } finally {
      this.uploading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.currentUser) return;

    this.saving = true;

    try {
      const data = this.profileForm.getRawValue();
      await this.userService.updateUser(this.currentUser.uid, {
        name: data.name,
        lastname: data.lastname,
        address: data.address,
        phone: data.phone,
        birthdate: data.birthdate || null
      });

      this.snack.open('Perfil actualizado', 'Cerrar', { duration: 3000 });
    } catch (err) {
      console.error(err);
      this.snack.open('Error al guardar cambios', 'Cerrar', { duration: 3000 });
    } finally {
      this.saving = false;
    }
  }
}
