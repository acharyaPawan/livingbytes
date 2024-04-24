

export default function JournalPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {




  return (
    <div className="max-w-screen-lg h-full mx-auto mt-4 flex flex-col gap-2">
      {children}
    </div>
  );
}
