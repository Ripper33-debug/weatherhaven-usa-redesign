import type { Metadata } from "next";
import "./sof-solutions.css";
import { SofNav } from "./_components/SofNav";
import { SofFooter } from "./_components/SofFooter";
import { SofEnhancements } from "./_components/SofEnhancements";
import { SofSolutionsChrome } from "./SofSolutionsChrome";

export const metadata: Metadata = {
  title: "SOF Solutions",
  description:
    "Mission-ready shelter systems for special operations — HQSS, softwall shelters, and turnkey camp infrastructure for denied, remote, and extreme environments.",
};

export default function SofSolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sof-solutions-root">
      <SofEnhancements />
      <SofSolutionsChrome
        nav={<SofNav />}
        footer={<SofFooter />}
      >
        {children}
      </SofSolutionsChrome>
    </div>
  );
}
