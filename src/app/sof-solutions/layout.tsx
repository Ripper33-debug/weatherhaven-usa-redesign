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
    <>
      <SofEnhancements />
      {/* SofSolutionsChrome adds the portal's own wrapper, nav and footer, except on the public page. */}
      <SofSolutionsChrome nav={<SofNav />} footer={<SofFooter />}>
        {children}
      </SofSolutionsChrome>
    </>
  );
}
