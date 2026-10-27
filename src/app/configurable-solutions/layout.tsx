import { ProductCompareProvider } from "@/contexts/ProductCompareContext";
import { ProductCompareTools } from "@/components/products/ProductCompareTools";

export default function ConfigurableSolutionsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProductCompareProvider>
      {children}
      <ProductCompareTools />
    </ProductCompareProvider>
  );
}
