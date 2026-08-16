export default function StudioLayout({ children }: LayoutProps<"/studio/[[...tool]]">) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
