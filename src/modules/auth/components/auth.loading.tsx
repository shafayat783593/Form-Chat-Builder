export default function AuthLoading({
  label = "Verifying account",
}: {
  label?: string;
}) {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center gap-4">
      <div className="relative">
        <div className="size-12 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 size-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}