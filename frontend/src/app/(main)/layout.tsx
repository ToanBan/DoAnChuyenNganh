import NavigationMain from "../components/share/NavigationMain";
import Chatbox from "../components/share/Chatbot";
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationMain/>
      {children}
      <Chatbox/>
    </>
  );
}