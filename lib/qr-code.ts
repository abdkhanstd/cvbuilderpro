import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}