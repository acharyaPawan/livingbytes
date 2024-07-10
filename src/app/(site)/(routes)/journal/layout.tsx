

export default function JournalPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {




  return (
    <div className="max-w-screen-lg mt-4">
      {children}
    </div>
  );
}
