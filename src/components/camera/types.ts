import { CameraType, CameraView } from 'expo-camera';
import { UserPreferences } from '../../../App';

export interface CapturedImage {
  uri: string;
  id: string;
}

export interface HeaderProps {
  title: string;
  subtitle: string;
}

export interface ActionButtonsProps {
  onOpenCamera: () => void;
  onPickImage: () => void;
}

export interface CapturedImagesGalleryProps {
  capturedImages: CapturedImage[];
  onRemoveImage: (id: string) => void;
}

export interface TipsSectionProps {
  tips: string[];
}

export interface CameraViewComponentProps {
  cameraRef: React.MutableRefObject<CameraView | null>;
  facing: CameraType;
  setFacing: (facing: CameraType | ((current: CameraType) => CameraType)) => void;
  onCapture: () => void;
  onCancel: () => void;
  isProcessing: boolean;
  processingMessage: string;
}

export interface PermissionRequestProps {
  onRequestPermission: () => void;
}

export interface BottomActionProps {
  capturedImages: CapturedImage[];
  isProcessing: boolean;
  onProcess: () => void;
}
