

export default function JournalPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {




  return (
    <div className="mx-auto mt-6 max-w-5xl space-y-6 px-4 pb-10">
      {children}
    </div>
  );
}
