import { FlyerData, Product } from '../../../App';

export interface ProductCardProps {
  product: Product;
  flyerIndex: number;
  productIndex: number;
  onEdit: (product: Product, flyerIndex: number, productIndex: number) => void;
  onDelete: (flyerIndex: number, productIndex: number) => void;
  formatPrice: (price: number) => string;
  getCategoryIcon: (category: string) => string;
  getCategoryColor: (category: string) => string;
}

export interface FlyerSectionProps {
  flyer: FlyerData;
  index: number;
  onAddProduct: (flyerIndex: number) => void;
  renderProduct: (product: Product, productIndex: number, flyerIndex: number) => JSX.Element;
}

export interface SummaryCardProps {
  totalProducts: number;
  totalStores: number;
}

export interface ScannedImagesProps {
  imageUris: string[];
}

export interface CategorySummaryProps {
  allProducts: Product[];
  getCategoryIcon: (category: string) => string;
}

export interface ProductFormModalProps {
  visible: boolean;
  editingProduct: { product: Product, flyerIndex: number, productIndex: number } | null;
  editForm: {
    name: string;
    price: string;
    category: string;
    unit: string;
    originalPrice: string;
    onSale: boolean;
  };
  onClose: () => void;
  onSave: () => void;
  setEditForm: React.Dispatch<React.SetStateAction<{
    name: string;
    price: string;
    category: string;
    unit: string;
    originalPrice: string;
    onSale: boolean;
  }>>;
  categories: string[];
  getCategoryIcon: (category: string) => string;
  getCategoryColor: (category: string) => string;
}

export interface BottomActionsProps {
  totalProducts: number;
  isGenerating: boolean;
  onBack: () => void;
  onGenerate: () => void;
}
