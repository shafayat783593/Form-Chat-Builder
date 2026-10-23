export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (

        <div className=" bg-gray-50 p-4">
        {children}
    </div>
    );
}