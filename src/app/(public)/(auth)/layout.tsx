export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (

        <div className="bg-background min-h-screen p-4">
        {children}
    </div>
    );
}