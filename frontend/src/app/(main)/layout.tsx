import NavigationMain from "../components/share/NavigationMain";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationMain/>
      {children}
    </>
  );
}