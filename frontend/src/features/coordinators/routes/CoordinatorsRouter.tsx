import { Outlet } from "react-router-dom";
import { Navbar } from "../../../components";

// Ya no es necesario, ya que todos utilizan la misma Navbar.
// Ahora se usará el AppLayout, a menos que se requiera algo específico y diferente para este router;...
// ...en ese caso, sí se utilizaría.
export const CoordinatorsRouter = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};
