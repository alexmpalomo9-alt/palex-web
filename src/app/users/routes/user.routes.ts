import { Routes } from "@angular/router";
import { UserProfileComponent } from "../components/user-profile/user-profile.component";

export const USER_ROUTES: Routes = [
  {
    path: '',
    children: [
      { path: 'profile', component: UserProfileComponent },           // /users/profile
      { path: 'profile/:userId', component: UserProfileComponent },  // /users/profile/123
    ],
  },
];
