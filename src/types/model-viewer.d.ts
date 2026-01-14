// Type definitions for @google/model-viewer
declare module "@google/model-viewer" {
  export class ModelViewerElement extends HTMLElement {
    src: string;
    alt: string;
    ar: boolean;
    arModes: string;
    cameraControls: boolean;
    autoRotate: boolean;
    shadowIntensity: number;
    exposure: number;
    canActivateAR: Promise<boolean>;
    activateAR(): void;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        alt?: string;
        ar?: boolean;
        "ar-modes"?: string;
        "ar-scale"?: string;
        "camera-controls"?: boolean;
        "touch-action"?: string;
        "auto-rotate"?: boolean;
        "auto-rotate-delay"?: string;
        "rotation-per-second"?: string;
        "shadow-intensity"?: string;
        "shadow-softness"?: string;
        exposure?: string;
        "environment-image"?: string;
        skybox?: string;
        poster?: string;
        loading?: string;
        reveal?: string;
        "camera-orbit"?: string;
        "camera-target"?: string;
        "field-of-view"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        interpolation?: string;
        interaction?: string;
        "interaction-prompt"?: string;
        "interaction-prompt-style"?: string;
        "interaction-prompt-threshold"?: string;
        "interaction-policy"?: string;
        ref?: React.Ref<HTMLElement>;
      };
    }
  }
}

export {};
