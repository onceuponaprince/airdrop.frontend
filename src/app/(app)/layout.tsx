export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth guard + sidebar will be wired in Phase 5 & 7
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1">{children}</main>
    </div>
  )
}
