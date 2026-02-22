import Navbar from '@/components/Navbar.client'
import Providers from '@/components/Providers.client'

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="font-work-sans">
      <Providers>
        <Navbar />

        {children}
      </Providers>
    </main>
  );
}