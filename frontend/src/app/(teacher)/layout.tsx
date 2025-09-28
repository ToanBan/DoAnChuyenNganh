import SiderbarTeacher from "../components/share/siderbar_teacher";
import 'bootstrap/dist/css/bootstrap.min.css';



export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiderbarTeacher />
      {children}
    </>
  );
}
