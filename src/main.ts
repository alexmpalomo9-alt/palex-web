import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { setLogLevel, LogLevel } from '@angular/fire';
import { register as registerSwiperElements } from 'swiper/element/bundle';


// ⚡ Configuramos log-level antes de bootstrap
setLogLevel(LogLevel.SILENT);
registerSwiperElements();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
