import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import QRCodeStyling from 'qr-code-styling';
import { SharedModule } from '../../../shared.module';

@Component({
  selector: 'app-qr-preview',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './qr-preview.component.html',
  styleUrls: ['./qr-preview.component.scss']
})
export class QrPreviewComponent implements AfterViewInit {
  @Input() data!: string;
  @Input() logoUrl?: string;

  @ViewChild('qrContainer', { static: true })
  qrContainer!: ElementRef<HTMLDivElement>;

  qrCode!: QRCodeStyling;

  ngAfterViewInit() {
    this.qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: this.data,
      image: this.logoUrl,
      margin: 10,
      qrOptions: { errorCorrectionLevel: 'H' },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.25,
        crossOrigin: 'anonymous',
      },
      dotsOptions: {
        type: 'dots',
        color: '#000',
      },
      backgroundOptions: { color: 'transparent' },
    });

    this.qrCode.append(this.qrContainer.nativeElement);
  }

  async downloadQR() {
    await this.qrCode.download({ name: 'mesa-qr', extension: 'png' });
  }

  async printQR() {
    const dataUrl = await this.qrCode.getRawData('png');
    const url = URL.createObjectURL(dataUrl as Blob);

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html>
        <head><title>Imprimir QR</title></head>
        <body style="text-align:center;margin-top:40px;">
          <img src="${url}" style="width:300px" />
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
  }
}
