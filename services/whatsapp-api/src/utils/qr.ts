import QRCode from 'qrcode';

export async function qrToDataURL(qr: string): Promise<string> {
  return QRCode.toDataURL(qr, { errorCorrectionLevel: 'L', margin: 1, width: 300 });
}
