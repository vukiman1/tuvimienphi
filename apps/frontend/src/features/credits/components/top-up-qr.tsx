interface TopUpQrProps {
  readonly qrImageUrl: string;
}

export function TopUpQr({ qrImageUrl }: TopUpQrProps) {
  return (
    <img
      alt="Mã QR chuyển khoản"
      className="mx-auto size-[220px] rounded-lg border border-[#e4d9c0] bg-white p-2"
      src={qrImageUrl}
    />
  );
}
