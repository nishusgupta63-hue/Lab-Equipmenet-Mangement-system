import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./Layout.css";

export default function Layout({ title, children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Navbar title={title} />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
